# Kimi Issue-Driven Coding Agent — システム設計書

版数: v1.5　作成日: 2026-07-04　対象: 個人開発（モノレポ内パッケージ、検証含む）

---

## 1. 概要

GitHub Issueに特定ラベル（`kimi-implement`）を付与することをトリガーに、OSSコーディングエージェント [OpenHands](https://github.com/OpenHands/OpenHands) と Moonshot AI の Kimi K2.7 Code モデルを組み合わせて自動実装を行い、Pull Requestとして提出するシステムを、Cloudflare上のサーバーレス基盤のみで構築する。

GitHub Actionsを使わず、常時契約不要（アイドル時は課金がほぼ発生しない）のCloudflare Containersを実行基盤とすることで、OSS/オープンモデルを用いた低コストなIssue駆動開発フローを実現する。

### 1.1 目的

- 中小規模の実装タスク（1〜数ファイルの機能実装、バグ修正）をAIエージェントに委譲し、人間はレビューに集中する
- GitHub Actionsのジョブ課金・実行時間制約から独立した、常駐不要のイベント駆動アーキテクチャを採用する
- OSS（OpenHands）とオープンモデル（Kimi K2.7 Code）の組み合わせにより、モデル利用コストを最小化する
- 個人のモノレポ構成に統合し、将来複数プロジェクトへ横展開できる形にしておく
- **将来的に複数モデルを使い分ける・並行実行するオーケストレーション基盤へ発展させることを見据え、LLM接続部分をプロバイダ非依存の抽象化層として設計する**（詳細は3.7参照）

### 1.2 スコープ

| 項目 | 内容 |
|---|---|
| 対象 | Issueベースの中規模実装タスク（1〜数ファイル） |
| 非対象 | マルチファイル大規模リファクタ、長時間（1時間超）セッションが前提のタスク |
| トリガー | GitHub Issueへの `kimi-implement` ラベル付与（`labeled` イベント） |
| 実行環境 | Cloudflare Containers |
| エージェント | OpenHands（MIT License, headlessモード） |
| LLM（現行） | Kimi K2.7 Code（`kimi-k2.7-code`）。接続経路はMoonshot直接またはOpenRouter経由を比較検証中 |
| LLM（将来） | タスク特性に応じた複数モデルのルーティング・並行実行（3.7参照） |
| 出力 | GitHub Pull Request（Issueとリンク） |
| リポジトリ構成 | 個人モノレポ内の独立パッケージ（`packages/kimi-agent`） |
| 運用フェーズ | 検証段階を含む個人利用。複数プロジェクトへの横展開、複数モデルオーケストレーションへの発展を将来的に想定 |

---

## 2. アーキテクチャ全体設計

イベント駆動型のパイプラインとして設計する。常駐サーバーを持たず、GitHub Webhookをトリガーに必要な時だけコンテナを起動し、タスク終了後は自動的にスリープさせることで、インフラコストを実行時間分のみに抑える。

> **設計変更(v1.3)**: 当初はOpenHands V0の「Dockerサンドボックス内でコード実行する」構造を前提にDocker-in-Docker(DinD)構成を組んでいたが、OpenHands CLI(v1系)はアーキテクチャが刷新され、デフォルトでは追加のサンドボックスコンテナを必要としない("Optional isolation"方針、ホスト上で直接実行)。Cloudflare Container自体がすでに1タスク=1回限りの使い捨て隔離環境であるため、内部でさらにDinDを組む必要はないと判断し、構成をシンプル化した。

### 2.1 全体構成図（論理構成）

```
┌─────────────┐   labeled event    ┌──────────────────────┐
│ GitHub Issue │ ─────────────────► │ GitHub Webhook         │
│ (対象PJ側)    │                    └───────────┬────────────┘
└─────────────┘                                │ POST (HMAC署名付き)
                                                ▼
                              ┌────────────────────────────────┐
                              │ Cloudflare Worker (Hono)          │
                              │  packages/kimi-agent 配下           │
                              │  - 署名検証                        │
                              │  - ラベルフィルタリング              │
                              │  - Durable Object経由でコンテナ起動  │
                              └───────────┬────────────────────────┘
                                          │ container.fetch()
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │ Cloudflare Container (Durable Object管理)   │
                    │  ┌────────────────────────────────────┐  │
                    │  │ タスク実行サーバー (Node.js/Hono)      │  │
                    │  │   │                                  │  │
                    │  │   ├─ git clone (対象リポジトリ)         │  │
                    │  │   ├─ config.toml 生成                 │  │
                    │  │   │    LLM: kimi-k2.7-code            │  │
                    │  │   │    base_url: api.moonshot.ai      │  │
                    │  │   ▼                                  │  │
                    │  │ openhands --headless --override-      │  │
                    │  │   with-envs (v1 CLI, サンドボックスなし) │  │
                    │  │   (workdir内で直接ファイル編集・        │  │
                    │  │    コマンド実行・gh pr create)          │  │
                    │  └────────────────────────────────────┘  │
                    └───────────┬──────────────────────────────────┘
                                │ git push + gh pr create
                                ▼
                    ┌───────────────────────┐
                    │ GitHub Pull Request     │
                    │ (Closes #issue番号)     │
                    │ 対象PJリポジトリ側に作成    │
                    └───────────────────────┘
```

### 2.2 コンポーネント一覧

| コンポーネント | 役割 | 技術 |
|---|---|---|
| Webhook受信 Worker | GitHub Webhookの受信、署名検証、ラベルフィルタ、コンテナ起動指示 | Cloudflare Workers, Hono, TypeScript |
| Durable Object | コンテナのライフサイクル管理（起動・スリープ・Issue単位の排他制御） | Cloudflare Durable Objects, `@cloudflare/containers` |
| Container | OpenHands実行環境（Docker不要、node:22-slimベース） | Cloudflare Containers |
| タスク実行サーバー | コンテナ内でIssueをリポジトリにクローンし、OpenHands headlessを起動する薄いHTTPサーバー | Node.js, Hono, TypeScript |
| OpenHands | Issue内容を解析し、コード実装・テスト実行・PR作成を自律実行するエージェント本体（v1系CLI） | OpenHands (OSS, MIT) |
| Kimi K2.7 Code | コーディング特化のLLM。OpenAI互換APIとして呼び出す | Moonshot AI API |
| GitHub API / CLI | 対象PJリポジトリの操作、PR作成、Issueへの結果コメント | GitHub REST API, GitHub CLI (`gh`) |

### 2.3 リポジトリ構成方針

個人のモノレポ内に、対象プロジェクトから独立したパッケージとして配置する。

```
my-monorepo/
├── packages/
│   ├── kimi-agent/              ← このエージェント基盤（本設計の対象）
│   │   ├── src/
│   │   │   ├── worker.ts
│   │   │   └── OpenHandsContainer.ts
│   │   ├── container/
│   │   │   ├── Dockerfile
│   │   │   ├── entrypoint.sh
│   │   │   ├── server.ts
│   │   │   └── promptBuilder.ts
│   │   ├── docs/
│   │   │   ├── system_design.md   （本書）
│   │   │   └── implementation_plan.md
│   │   ├── wrangler.jsonc
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── project-a/                ← 検証対象PJ（既存 or 新規）
│   └── project-b/                ← 将来のPJ
│
├── package.json                  ← workspace定義
└── pnpm-workspace.yaml
```

理由:

- デプロイ単位（`wrangler deploy`）が `packages/kimi-agent` 内で完結し、他PJのデプロイと独立している
- `SANDBOX_SELECTED_REPO` を環境変数・Webhookペイロードで渡す設計のため、対象PJが増えても `kimi-agent` 自体の変更は不要
- 自己完結したパッケージ構造のため、将来複数人での利用や独立リポジトリへの切り出しが低コスト
- GitHub Tokenのスコープは対象PJリポジトリに対して発行し、モノレポ自体を編集対象にはしない

---

## 3. 詳細設計

### 3.1 トリガーフロー

1. 対象PJのGitHub Issueに `kimi-implement` ラベルが付与されると、GitHub Webhookが `kimi-agent` のCloudflare Worker にPOSTリクエストを送信する
2. Workerは `X-Hub-Signature-256` ヘッダーによるHMAC-SHA256署名検証を行い、正規のGitHubからのリクエストであることを確認する
3. イベントタイプが `labeled` かつラベル名が `kimi-implement` の場合のみ処理を継続する（それ以外は200 OKで即座に無視）
4. Issue番号とリポジトリ名から一意のコンテナインスタンスIDを生成し（例: `issue-{repo}-{issue_number}`）、同一Issueに対する重複起動を防止する

### 3.2 コンテナ内実行フロー

1. Cloudflare Containerが起動すると、entrypointスクリプトが`openhands`コマンドの存在を確認したのち、Node.js製のタスク実行サーバーが8080番ポートで待受を開始する
2. WorkerからのHTTPリクエストを受けて、対象リポジトリを`git clone`でコンテナ内の作業ディレクトリ（`/workspace/issue-{issue_number}`）にクローンする
3. タスク専用のホームディレクトリ（`/workspace/.home-{issue_number}`）に、LLM接続設定・反復回数上限を含む`config.toml`を動的生成する
4. Issue本文からプロンプトを構築し、`openhands --headless --json --override-with-envs -t "<プロンプト>"`をクローン済みの作業ディレクトリをカレントディレクトリとして起動する
5. OpenHands CLI（v1系）はデフォルトでサンドボックスコンテナを追加起動せず、コンテナ内で直接ファイル操作・コマンド実行を行う（Cloudflare Container自体がすでに使い捨ての隔離環境であるため、二重のサンドボックス化は行わない）
6. 実装完了後、OpenHandsはterminalツール経由でGitHub CLI（`gh pr create`）を実行し、新規ブランチへのpush・Pull Requestの作成までを自律的に実行する
7. タスク完了（プロセス終了）後、実行結果（成功/失敗、ログ）をWorkerに返却する
8. 失敗時は、Workerが元のIssueに失敗内容をコメントとして自動投稿する

### 3.3 LLM接続設計（マルチプロバイダ対応）

> **設計方針の転換（v1.5）**: 当初はKimi K2.7 CodeをMoonshot APIに直接接続する設計だったが、将来的な複数モデル利用・オーケストレーションを見据え、**LLM接続部分をプロバイダ非依存の抽象化層として設計する**方針に変更した。現時点ではKimi K2.7 Codeを主に使うが、接続先（Moonshot直接 / OpenRouter経由 / 他プロバイダ）やモデル自体を設定の変更のみで切り替えられるようにする。

**プロバイダ選定の背景**: Kimi K2.7 Codeは"Preserved Thinking"が常時有効（`thinking.keep`が`"all"`固定）であり、マルチターンのツール呼び出しでは過去のアシスタントメッセージの`reasoning_content`を会話履歴に保持して送り返す必要がある。OpenHandsが内部で利用するLiteLLMは、この要件への対応が新モデルのリリースに追いつかず、過去に`kimi-k2.5`・`kimi-k2.6`で400エラーを引き起こす不具合が繰り返し報告されている（[litellm#21672](https://github.com/BerriAI/litellm/issues/21672), [litellm#26156](https://github.com/BerriAI/litellm/issues/26156)）。一方、OpenRouterは提供モデルの説明で「thinking modeで全ての推論内容をマルチターン間で保持する」処理を自社側で担っていると明記しており、これが事実であればMoonshot直接接続よりも安定する可能性がある。**この優劣は実測が必要であり、実装計画書のT2-0で両経路を比較検証する。**

**プロバイダ抽象化の設計**

LLM接続情報を環境変数`LLM_PROVIDER`で切り替え、`config.toml`生成ロジック（タスク実行サーバー内）がプロバイダごとの差分（`base_url`, `model`名の書式, APIキー）を吸収する。

```toml
# provider = "moonshot" の場合
[llm]
model = "openai/kimi-k2.7-code"
base_url = "https://api.moonshot.ai/v1"
api_key = "<KIMI_API_KEY>"

# provider = "openrouter" の場合
[llm]
model = "openrouter/moonshotai/kimi-k2.7-code"
base_url = "https://openrouter.ai/api/v1"
api_key = "<OPENROUTER_API_KEY>"
```

```
[core]
max_iterations = 80
max_budget_per_task = 0.0
```

Kimi K2.7 Codeは256Kコンテキストウィンドウ、常時thinkingモードで動作する。`tool_choice`は`auto`または`none`のみサポートするため、OpenHands側のツール呼び出し設定はデフォルト（`auto`）を使用する。この制約はMoonshot直接・OpenRouter経由のいずれでも同様に適用されると想定されるが、実測で確認する。

反復回数の上限（`max_iterations`）はOpenHands CLIにコマンドラインフラグが存在せず、`config.toml`経由でのみ確実に制御できる（環境変数からの上書きは信頼性の観点から採用しない）。

### 3.4 コンテナイメージ構成

コンテナイメージは`node:22-slim`をベースとし、Python（OpenHands本体の実行に必要）、git、GitHub CLIを追加する軽量な構成とした。

> **設計変更の経緯**: 当初はOpenHands V0のDocker-in-Docker構造を前提に`docker:dind-rootless`ベースイメージを採用していたが、OpenHands CLI（v1系）はサンドボックスコンテナを必須としないアーキテクチャに刷新されたため、DinD関連の設定（rootlessモード、`--iptables=false`、内部コンテナ間の`--network=host`通信）はすべて不要になった。これにより、イメージサイズの削減、起動時間の短縮、Cloudflare Containers側のDinD制約（ベータ機能特有の不安定性）への依存が解消された。

| 項目 | 内容 |
|---|---|
| ベースイメージ | `node:22-slim`（`--platform=linux/amd64`を明示） |
| OpenHandsインストール方法 | `uv tool install openhands --python 3.12`（`pip install openhands-ai`はレガシーV0 SDKのため不採用） |
| 実行ユーザー | `node`ユーザー（UID 1000、非root） |
| ワークスペース | `/workspace`配下にタスクごとのディレクトリを動的作成（`issue-{番号}`、`.home-{番号}`） |

> **注意（開発環境がApple Silicon等arm64の場合）**: Cloudflare Containersは`linux/amd64`アーキテクチャのイメージを要求する（[公式ドキュメント](https://developers.cloudflare.com/containers/get-started/)）。Apple Silicon Mac等でローカルビルドする場合、Dockerのデフォルト挙動ではarm64向けにビルドされてしまうため、Dockerfileの`FROM`行で`--platform=linux/amd64`を明示する必要がある（本プロジェクトのDockerfileは対応済み）。また、VPNやCloudflare Oneクライアント等のTLS傍受を行うツールを使用している環境では、ビルド中のHTTPSリクエスト（`uv`インストーラ、GitHub CLIのダウンロード等）が証明書エラーで失敗する場合がある点にも注意する（[公式ドキュメント](https://developers.cloudflare.com/containers/local-dev/)）。

### 3.5 同時実行制御・スケーリング

- Durable Objectのインスタンス名にIssue番号を含めることで、同一Issueに対する多重起動をCloudflareのDurable Objectの一意性保証により自然に防止する
- wrangler設定の `max_instances` により、アカウント全体での同時実行コンテナ数の上限を制御する（初期値: 3、個人検証段階のため小さめに設定）
- アイドル状態が15分続いたコンテナは自動的にスリープし、CPU課金が停止する（`sleepAfter`設定）

### 3.6 セキュリティ設計

| 観点 | 対策 |
|---|---|
| Webhook認証 | GitHub Webhook Secretを用いたHMAC-SHA256署名検証を全リクエストに対して実施 |
| シークレット管理 | `GITHUB_TOKEN`, `KIMI_API_KEY`, `WEBHOOK_SECRET`はすべて`wrangler secret`（Cloudflare Secrets）で管理し、コードにハードコードしない |
| GitHub Token権限 | **対象PJリポジトリ**への`contents:write`, `pull_requests:write`, `issues:write`に限定したFine-grained PATを使用する（モノレポ自体への権限は付与しない） |
| 自動承認モードのリスク | OpenHands headlessモードは常時自動承認（always-approve）で動作するため、人間によるレビューは必ずPull Requestの段階で実施する。対象PJのmainブランチへの直接pushは行わない |
| ネットワーク制御 | コンテナからのegressは`api.moonshot.ai`（Kimi API）, `api.github.com`, `github.com`（git clone/push）等の必要最小限のドメインに限定することを推奨する（個人検証段階のため初期は緩やかに開始し、段階的に強化する） |
| GitHub連携の信頼性 | OpenHandsの自己ホストCLI版によるPR作成は、公式が提供する専用連携機能ではなく、OpenHandsの汎用シェル実行能力（terminalツール）を用いてプロンプトの指示通りに`gh pr create`を実行する仕組みに依存している。したがって、確実にPRが作成される保証はプロンプトの明確さに依存する。失敗時はIssueへの通知（3.2参照）で人間に伝達し、リトライまたは手動対応を促す運用とする |

### 3.7 マルチモデルオーケストレーション（将来設計）

個人開発の最終目標として、単一モデル（Kimi K2.7 Code）への依存から、**タスク特性に応じて複数モデルを使い分ける、または並行実行するオーケストレーション基盤**への発展を見据える。本セクションでは、現行の単一モデル構成からの移行パスを整理する。

**発展の3段階**

| 段階 | 内容 | 現行設計との関係 |
|---|---|---|
| 段階1（現行） | Kimi K2.7 Code単体、接続経路（Moonshot直接/OpenRouter）は切替可能 | 3.3で設計済み |
| 段階2 | タスク種別に応じたモデルルーティング（例: 軽微な修正はKimi、複雑な設計判断はClaude/GPT） | `config.toml`の`[llm]`セクションをタスク実行サーバーが動的に選択する仕組みを追加 |
| 段階3 | 複数モデルの並行実行・結果比較、またはマルチエージェント協調（役割分担） | Cloudflare Queues等でタスクを分配し、複数コンテナインスタンスが異なるモデルで並行実行する構成 |

**段階2の設計方針（次に着手する現実的な一歩）**

タスク実行サーバー（`server.ts`）内に、モデル選定ロジックを追加する。選定基準の候補:

- **Issueのラベル**による明示指定（例: `kimi-implement` は現行のKimi、`claude-implement` はClaude系にルーティング）
- **Issue本文の複雑度**（文字数、関連ファイル数等の簡易ヒューリスティック）による自動選択
- **失敗時のフォールバック**（Kimiでタスクが失敗した場合、別モデルで再試行する）

いずれの場合も、LiteLLMがモデル横断のインターフェースを提供しているため、`config.toml`の`[llm]`セクションの`model`/`base_url`/`api_key`を差し替えるだけでモデル切り替え自体は実現できる。段階2で必要になるのは、**どのモデルを選ぶかを決めるルーティングロジック**である。

**段階3で想定される課題（現時点では未着手、検討事項として記録）**

- 複数コンテナを同時に起動する場合のコスト管理（`max_instances`の引き上げ、Cloudflare Containersの無料枠超過リスク）
- 複数モデルの結果を統合・比較する仕組み（例: 2モデルが別々のPRを作成し、人間がどちらを採用するか選ぶ運用）
- モデルごとに異なるプロンプト最適化が必要になる可能性（Kimi向けに調整したプロンプトが他モデルでも同等に機能するとは限らない）
- OpenHands以外のエージェント（Kimi Code CLI等、モデル専用ツール）を併用する場合、タスク実行サーバー側の抽象化をエージェント単位でも設ける必要が生じる

**今回の設計判断との整合性**

3.3で導入した「LLM接続のプロバイダ抽象化」は、段階2以降に進むための土台として意図的に設計している。目先はKimi K2.7 Code一本であっても、接続情報を環境変数・設定ファイルで外出しにしておくことで、将来のモデル追加時にタスク実行サーバーの中核ロジック（Issueクローン、プロンプト構築、結果ハンドリング）を変更せずに済む。

---

## 4. コスト設計

中規模タスク（1〜数ファイルの実装）を月20〜30件処理する場合の概算。

| 費目 | 課金モデル | 月間目安 |
|---|---|---|
| Cloudflare Workers | Workers Paid Plan固定費 | $5/月 |
| Cloudflare Containers CPU/メモリ | 実行時間の従量課金（無料枠あり） | 無料枠内〜数百円/月 |
| Kimi K2.7 Code API | 入出力トークン従量課金 | $2〜6/月 |
| **合計目安** | - | **約$7〜11/月** |

VPS常駐方式（月$12〜26）およびVercel Sandbox方式（セッション上限45分、Docker実行非対応）と比較し、本構成が最もコスト効率と実行環境の自由度のバランスに優れると判断した。

---

## 5. 採用技術と選定理由まとめ

| 技術 | 選定理由 |
|---|---|
| Cloudflare Containers | アイドル時課金なし、個人モノレポの既存Cloudflareスタックとの統合が容易、セッション時間の明確な上限なし |
| Hono | 軽量・型安全なWebフレームワーク。Cloudflare Workers上での標準的な選択肢 |
| OpenHands | MITライセンスのOSS、OpenAI互換APIならどのLLMプロバイダにも接続可能、SWE-bench Verifiedで高スコアの実績 |
| Kimi K2.7 Code | OpenAI互換、256Kコンテキスト、コーディング特化でMCPツール利用に強く、価格が主要クローズドモデルの数分の1 |
| TypeScript（フルスタック） | Worker・コンテナ内サーバーの両方をTypeScriptで統一 |
| モノレポ内独立パッケージ | 対象PJのデプロイライフサイクルと分離しつつ、将来の複数PJ横展開・独立リポジトリ化を低コストにする |

---

## 6. 制約事項・今後の課題

- DinD構成を廃止したことで、Cloudflare Containers特有のベータ機能（DinDサポート）への依存はなくなったが、OpenHands CLI（v1系）自体のバージョンアップに伴うCLIフラグ・設定ファイル形式の変更には継続的な追従が必要（実際に本設計中もCLI仕様の確認により複数箇所の設計修正が発生した）
- コンテナごとに`uv tool install openhands`でOpenHandsをインストールする構成のため、依存パッケージのバージョンをDockerfileで固定しない限り、ビルドのたびに最新版が入る点に注意（再現性を重視する場合はバージョンピンを検討する）
- タスク量やプロジェクト数が増加した場合、Northflank等のBYOC型プラットフォームとの再比較、または独立リポジトリへの切り出しを検討する
- 複雑なマルチファイルリファクタや長時間セッションが必要なタスクは、本システムのスコープ外とする
- OpenHands公式が提供するSaaS版「OpenHands Cloud」は、無料枠が1日10会話までに制限されており、Issue駆動の継続的な自動化用途には不向きと判断し不採用とした。詳細な比較は別紙「OpenHands Cloud 調査・本基盤との比較」を参照
- OpenHands CLIはコンテナ内で直接ファイル操作・シェルコマンドを実行する（追加のサンドボックス層を持たない）ため、Cloudflare Container自体の隔離性がセキュリティ境界の実質的な担保となる。この前提を踏まえ、コンテナに付与する権限（GitHub Tokenのスコープ等）は必要最小限に保つ
