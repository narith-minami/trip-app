# Kimi Issue-Driven Coding Agent — 実装計画書

版数: v1.5　作成日: 2026-07-04　粒度: タスク単位（作業項目・検証方法を明記）

---

## 1. 全体スケジュール概要

個人開発・モノレポ構成想定のため、フェーズを5つに分割し、各フェーズで動作確認できる単位に区切る。

**v1.2での変更点**: Phase 2はローカルDocker（DinD込み）での検証を予定していたが、ローカルマシンでのDinD再現は環境構築負荷が高い上、Cloudflare Containers特有のDinD制約は結局Cloudflare実機でしか正確に検証できないと判断し、以下のように組み替えた。

- **Phase 2**: Dockerを使わない軽量版（`RUNTIME=local`）でOpenHands + Kimiのロジックのみを検証
- **Phase 3**: Cloudflareへのデプロイに加え、DinD固有の実機検証（T3-5として新設）をここに統合

**v1.3での変更点**: Phase 1の実装作業中に、OpenHands CLI（v1系）の実際の仕様を確認したところ、そもそもDinD構成自体が不要であることが判明した。OpenHands CLI（v1系）はアーキテクチャが刷新されており、デフォルトでは追加のサンドボックスコンテナを必要としない（"Optional isolation"方針）。Cloudflare Container自体がすでに1タスク=1回限りの使い捨て隔離環境であるため、内部でさらにDinDを組む必要がないと判断し、**DinD構成そのものを廃止**した。

これに伴い、以下の変更を行った。

- ベースイメージを`docker:dind-rootless`から`node:22-slim`に変更（大幅な軽量化）
- T1-2のentrypoint.shからdockerd起動処理を削除
- T3-5は「DinD実機検証」から「Cloudflare実機でのコンテナ動作確認」（通常のデプロイ後動作確認）に性格が変化
- OpenHands呼び出し方法も、調査により当初想定が誤り（存在しない`--max-iterations`フラグ等）と判明したため、`openhands --headless --json --override-with-envs`と`config.toml`動的生成による正しい方式に修正

結果として、当初懸念していた「ローカルでのDinD検証が重い」という問題は、DinD自体が不要になったことで解消された。

**v1.4での変更点**: 実装済み内容の追加調査により、Kimi K2.7 Codeの"Preserved Thinking"要件（マルチターンでの`reasoning_content`保持必須）とOpenHandsが依存するLiteLLM側の対応状況に重大リスクの可能性が見つかった。T2-0として最優先の検証タスクを新設した。また、Cloudflare Containersの`linux/amd64`要件、VPN起因のビルド失敗等、中程度の考慮漏れをDockerfile・各種ドキュメントに反映した。

**v1.5での変更点**: 将来的な複数モデル利用・オーケストレーションという方針が明確になったことを受け、以下を追加した。

- **T1-3b（新設）**: LLM接続をプロバイダ非依存の抽象化層として実装し、Moonshot直接・OpenRouter経由等を設定の変更のみで切り替え可能にする
- **T2-0の拡張**: Preserved Thinking要件の検証を、Moonshot直接とOpenRouter経由の**比較検証**に拡張。OpenRouterがこの要件を吸収している可能性がある、という仮説を実測で確認する
- **Phase 5（新設）**: 単一モデル構成が安定稼働した後の、複数モデルルーティング・並行実行への発展計画を記録（詳細タスク分解は着手時に行う）

| フェーズ | 内容 | 目安工数 |
|---|---|---|
| Phase 0 | 事前準備（アカウント・シークレット・モノレポ整備） | 0.5日 |
| Phase 1 | コンテナ側実装（Dockerfile, entrypoint, タスク実行サーバー, LLMプロバイダ抽象化） | 1.5〜2日 |
| Phase 2 | OpenHands + Kimi のロジック検証（Dockerなし、Moonshot/OpenRouter比較含む） | 1日 |
| Phase 3 | Cloudflare Worker/Containerデプロイ + 実機動作確認 | 1.5〜2日 |
| Phase 4 | GitHub連携・E2E検証・運用ドキュメント整備 | 1日 |
| Phase 5 | マルチモデルオーケストレーションへの拡張（将来、着手条件成立後） | 未見積（着手時に別途計画） |

---

## 2. Phase 0: 事前準備

### T0-1　Kimi API アカウント・APIキー取得（Moonshot直接・OpenRouter両方）

**目的**: Moonshot API（platform.kimi.ai）とOpenRouterの両方のAPIキーを取得し、動作確認する（T2-0での比較検証に両方使用するため）

**作業項目**
- platform.kimi.ai でアカウント登録し、APIキーを発行
- openrouter.ai でアカウント登録し、APIキーを発行（クレジット購入が必要な場合あり）
- 両方について、curlで疎通確認（chat/completions エンドポイントに簡単なリクエスト）

**検証方法**
- curlでkimi-k2.7-codeモデルに対してMoonshot直接・OpenRouter経由それぞれリクエストを送り、200 OKとレスポンスが返ることを確認する

**成果物**: 有効な `KIMI_API_KEY`、有効な `OPENROUTER_API_KEY`

---

### T0-2　GitHub Fine-grained PAT の準備

**目的**: OpenHandsが対象PJリポジトリへのPR作成・push操作を行うための認証情報を用意する

**作業項目**
- 検証対象PJリポジトリ（プライベート）に対して `contents:write`, `pull_requests:write`, `issues:write` 権限を持つFine-grained PATを発行する
- **モノレポ自体には権限を付与しない**（対象は検証PJリポジトリのみ）

**検証方法**
- 発行したトークンで対象リポジトリへのAPI疎通確認（`GET /repos/{owner}/{repo}`）を行う

**成果物**: 有効な `GITHUB_TOKEN`

---

### T0-3　Cloudflareアカウント・Wrangler CLI準備

**目的**: Cloudflare Workers/Containersを利用するための環境を整備する

**作業項目**
- Cloudflare Workers Paid Planへの加入（$5/月、Containers利用に必須）
- wrangler CLIのインストール・ログイン（`npm install -g wrangler && wrangler login`）
- ローカルにDocker Desktop（またはColima等）をインストール（`wrangler deploy`でのイメージビルドに必要）

**検証方法**
- `wrangler whoami` でログイン状態を確認
- `docker info` でDockerデーモンが起動していることを確認

**成果物**: デプロイ可能な状態のCloudflareアカウントとローカル環境

---

### T0-4　GitHub Webhook Secret生成

**目的**: Webhook署名検証用のシークレットを生成する

**作業項目**
- `openssl rand -hex 32` 等でランダム文字列を生成

**検証方法**
- 生成した文字列の長さ・文字種を確認（32byte以上を推奨）

**成果物**: `WEBHOOK_SECRET` 文字列（後でCloudflare Secretsとして登録）

---

### T0-5　モノレポへの `packages/kimi-agent` 追加

**目的**: 個人のモノレポ内に、本パッケージを独立した形で追加する

**作業項目**
- モノレポのworkspace設定（`pnpm-workspace.yaml` 等）に `packages/*` が含まれていることを確認。含まれていなければ追加する
- `packages/kimi-agent/` ディレクトリを作成
- `packages/kimi-agent/package.json` を新規作成し、パッケージ名・バージョン・依存関係の枠組みを定義する
- ルートの `package.json` から `kimi-agent` 向けのスクリプト（例: `deploy:kimi-agent`）をworkspace経由で呼べるように設定する

**検証方法**
- モノレポルートで `pnpm -F kimi-agent install`（またはnpm/yarn workspace相当のコマンド）が成功することを確認
- 他パッケージのビルド・依存関係に影響を与えていないことを確認（既存PJの `pnpm install` が壊れていないか）

**成果物**: `packages/kimi-agent/package.json`、workspace設定更新

**検証済みの注意事項（実施結果より）**
- `package.json`のスクリプト名に`deploy`をそのまま使うと、pnpm独自の予約コマンド（`pnpm deploy <target>`、パッケージの公開用ディレクトリ生成コマンド）と衝突する。`wrangler-deploy`等の別名にすること
- `wrangler deploy`実行時、workspace構成では「Auto-configuration of projects inside workspaces is limited」という警告が出ることを実機で確認済み。これはT3-1で`wrangler.jsonc`を明示的に用意することで回避される、想定内の挙動
- `pnpm install`時に`esbuild`, `sharp`, `workerd`等のpostinstallスクリプトがpnpmのセキュリティ機能によりデフォルトで無効化される（`ERR_PNPM_IGNORED_BUILDS`）。`pnpm approve-builds --all`で明示的に承認する必要がある

---

## 3. Phase 1: コンテナ側実装

### T1-1　Dockerfile作成

**目的**: Cloudflare Containers上でOpenHands CLI（v1系）を動かすためのコンテナイメージを定義する

> **設計変更**: 当初計画していた`docker:dind-rootless`ベース + Docker-in-Docker構成は、OpenHands CLI（v1系）がサンドボックスコンテナを必須としないアーキテクチャに刷新されたことを踏まえ廃止した。`node:22-slim`ベースの軽量構成に変更している。

**作業項目**
- `node:22-slim` をベースイメージとして選定
- Python3, git, curl, build-essential等の必要パッケージをインストール
- `uv tool install openhands --python 3.12` でOpenHands CLI（v1系）本体をインストール（`pip install openhands-ai`はレガシーV0 SDKのため不使用）
- GitHub CLI（`gh`）をインストール（OpenHandsがterminalツール経由でPR作成に使用）
- 非rootユーザー（`node`、UID 1000。`node:slim`系イメージに標準で存在）での実行を前提としたパーミッション設定を行う

**検証方法**
- ローカルで `docker build .` が成功することを確認
- `docker run --rm -it <image> sh` でコンテナに入り、`python3`, `node`, `git`, `gh`, `openhands` コマンドが利用可能なことを確認

**成果物**: `packages/kimi-agent/container/Dockerfile`

**実施結果**: Dockerfile本体を作成済み。DinD廃止によりベースイメージが`docker:27-dind-rootless`から`node:22-slim`に変わり、構成が大幅に簡略化された。**実際の`docker build`によるビルド検証は、Dockerを持つローカル環境での実施が必要**(本作業環境にはDockerランタイムがないため未実施)。Dockerfile自体の構文チェックは完了。

---

### T1-2　entrypoint.sh作成

**目的**: OpenHands CLIの存在確認を行い、タスク実行サーバーを起動するシンプルなエントリーポイントを実装する

> **設計変更**: DinD廃止に伴い、dockerd起動待ち処理は不要になった。

**作業項目**
- `openhands`コマンドがPATH上に存在するか確認する処理を実装
- Node.jsタスクサーバー（`server.ts`）を`exec`で起動

**検証方法**
- ローカルDocker環境でコンテナを起動し、ログに`openhands`コマンドの存在確認結果とバージョン情報が出力されることを確認

**成果物**: `packages/kimi-agent/container/entrypoint.sh`

**実施結果**: entrypoint.shを作成済み。DinD廃止によりdockerd起動処理が不要になり、内容は「openhandsコマンドの存在確認 → タスクサーバー起動」のみのシンプルな構成となった。シェル構文チェック(`sh -n`)は完了。**実際のDocker環境での起動検証は未実施**(T1-1と同様の制約)。

---

### T1-3　タスク実行サーバー実装（TypeScript）

**目的**: Workerからのリクエストを受け、対象リポジトリをクローンした上でOpenHands CLI（v1系, headlessモード）をサブプロセスとして起動するHTTPサーバーを実装する

> **設計変更**: OpenHands CLI（v1系）の実際の仕様調査により、当初想定していた`python3 -m openhands.core.main --max-iterations 80`という呼び出し方は誤り（レガシーV0の呼び出し方であり、`--max-iterations`フラグ自体が現行CLIには存在しない）と判明した。正しくは`openhands --headless --json --override-with-envs -t "<プロンプト>"`で起動し、反復回数上限は`config.toml`の`[core] max_iterations`でのみ制御できる。また、環境変数`LLM_MODEL`等はデフォルトで無視されるため、`config.toml`を都度動的生成する方式に変更した。

**作業項目**
- Honoまたは軽量Node.js httpモジュールで `/run-task` エンドポイントを実装
- リクエストボディ（`issueNumber`, `issueTitle`, `issueBody`, `repo`, `githubToken`, `kimiApiKey`）を受け取る
- タスク専用の作業ディレクトリに対象リポジトリを`git clone`する
- タスク専用のホームディレクトリに`$HOME/.openhands/config.toml`を動的生成し、LLM接続設定（Kimi K2.7 Code）と`max_iterations`を書き込む
- `child_process.spawn` で `openhands --headless --json --override-with-envs -t "<プロンプト>"` を、クローン済みディレクトリをcwdとして起動する
- 標準出力・標準エラーを収集し、プロセス終了後にJSON形式でレスポンスを返却する
- esbuildまたはtsxでTypeScript→実行可能形式へのビルド設定を追加

**検証方法**
- ローカルでサーバーを起動し、curlで `/run-task` にモックリクエストを送信、レスポンスが返ることを確認
- ログにIssue内容が正しくプロンプトへ反映されていることを確認
- 実際に指定した公開リポジトリがクローンされ、`config.toml`が正しい内容・パスに生成されることを確認

**成果物**: `packages/kimi-agent/container/server/src/server.ts`, `types.ts`, `package.json`, `tsconfig.json`

**実施結果**: Hono + @hono/node-serverでHTTPサーバーを実装し、`/health`と`/run-task`エンドポイントを用意。実機検証を行い以下を確認済み。
- `npx tsc --noEmit` で型エラーなし
- `esbuild`によるバンドルが成功（`dist/server.js`, 83.7kb）
- `/health`が`{"status":"ok"}`を返すことを確認
- 不正なリクエストボディに対して`{"error":"invalid request body"}`と400相当のレスポンスを返すことを確認
- 正常形式のリクエスト（実在の公開リポジトリ`octocat/Hello-World`を指定）に対し、実際に`git clone`が成功し、`/workspace/.home-{issue番号}/.openhands/config.toml`に正しい内容（`max_iterations`, LLM接続設定）が生成されることを確認
- `openhands`コマンド自体が本環境に未インストールのため最終的には`spawn openhands ENOENT`で失敗するが、サーバーはクラッシュせず`exitCode: 1`と詳細ログを含むJSONレスポンスを返すことを確認。異常系ハンドリング(T2-2相当)の基礎部分が機能していることも合わせて確認できた
- git clone・config.toml生成というOpenHands本体呼び出し前の前処理ロジックは、この検証で実証済みとなった。`openhands`コマンド自体の呼び出しが正しく機能するかはT2-1で検証する

---

### T1-3b　LLM接続のプロバイダ抽象化（マルチモデル対応の土台）

**目的**: 将来的な複数モデル利用・オーケストレーションを見据え、T1-3で実装した`config.toml`生成ロジックを、接続先プロバイダ（Moonshot直接 / OpenRouter経由 / 将来的な他プロバイダ）に依存しない形に拡張する

**背景**: 現時点ではKimi K2.7 Code単体の利用だが、将来的にタスク特性に応じたモデルの使い分け・並行実行（オーケストレーション）へ発展させる方針があるため、LLM接続部分を早い段階で抽象化しておくことで、後の変更コストを抑える（詳細な段階的発展計画はsystem_design.md 3.7参照）。

**作業項目**
- `types.ts`の`RunTaskRequest`に、接続プロバイダを指定する`llmProvider`フィールド（例: `"moonshot" | "openrouter"`）を追加する（省略時は`"moonshot"`をデフォルトとする）
- プロバイダごとの接続情報（`base_url`, モデル名の書式）をマッピングするテーブルを`server.ts`または新規`llmProviders.ts`に定義する

```typescript
const LLM_PROVIDERS = {
  moonshot: {
    baseUrl: "https://api.moonshot.ai/v1",
    model: "openai/kimi-k2.7-code",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openrouter/moonshotai/kimi-k2.7-code",
  },
} as const;
```

- `writeConfigToml()`関数を、指定されたプロバイダの接続情報を使って`config.toml`を生成するように修正する
- Workerの`wrangler.jsonc`のSecretsに`OPENROUTER_API_KEY`を追加する余地を残す（T3-3で必要に応じて登録）

**検証方法**
- `llmProvider: "moonshot"`と`llmProvider: "openrouter"`のそれぞれで`/run-task`にリクエストを送り、生成される`config.toml`の内容がプロバイダごとに正しく切り替わることを確認する
- 既存のテスト（T1-3で実施したもの）が、この変更後も同様にパスすることを確認する（リグレッションがないことの確認）

**成果物**: `packages/kimi-agent/container/server/src/llmProviders.ts`、更新済み`server.ts`, `types.ts`

**実施結果**: `llmProviders.ts`を新規作成し、`LLM_PROVIDERS`テーブルに`moonshot`/`openrouter`の2エントリを定義。`types.ts`の`RunTaskRequest`に`llmProvider?: LlmProviderId`フィールドを追加し、`kimiApiKey`は汎用的な`llmApiKey`にリネームした。`server.ts`の`writeConfigToml()`を`resolveLlmProvider()`経由で接続情報を解決する形に修正。

実機検証で以下を確認済み:
- `npx tsc --noEmit`で型エラーなし、`esbuild`バンドル成功（84.8kb）
- `llmProvider`省略時にデフォルトの`moonshot`が適用され、`config.toml`に`base_url = "https://api.moonshot.ai/v1"`, `model = "openai/kimi-k2.7-code"`が正しく書き込まれることを確認
- `llmProvider: "openrouter"`を明示指定した場合、`config.toml`に`base_url = "https://openrouter.ai/api/v1"`, `model = "openrouter/moonshotai/kimi-k2.7-code"`へ正しく切り替わることを確認
- レスポンスの`llmProviderUsed`フィールドで、実行に使用したプロバイダを識別できることを確認（T2-0での比較検証時にログから判別しやすくするため）

このプロバイダ抽象化により、T2-0での比較検証は`llmProvider`パラメータを変えるだけで両経路を試せる状態になっている。

---

### T1-4　OpenHandsプロンプトテンプレート設計

**目的**: Issue本文からOpenHandsへの指示プロンプトを構築するロジックを実装する

**作業項目**
- タイトル・本文・制約事項（コードスタイル遵守、テスト実行、PR作成指示）をテンプレート化
- Issue本文にコードブロックや画像が含まれる場合の扱いを定義（初期版はテキストのみ対応とし、画像は将来対応とする）

**検証方法**
- サンプルIssue（タイトル・本文）を用意し、生成されるプロンプト文字列を目視確認する

**成果物**: `packages/kimi-agent/container/server/src/promptBuilder.ts`

**実施結果**: `buildPrompt()`関数を実装。Issue番号・タイトル・本文をそのまま伝えつつ、コードスタイル遵守・テスト実行・PR作成（`gh pr create`経由）・mainブランチへの直接push禁止を制約として明記する構成とした。Issue本文が極端に長い場合(20,000文字超)への安全弁として切り詰め処理も追加。実際のE2E検証(生成されたプロンプトでOpenHandsが意図通り動くか)はT2-1で実施する。

---

## 4. Phase 2: OpenHands + Kimi のロジック検証（Dockerなし）

**方針の経緯**: 当初はローカルDocker（DinD込み）でCloudflare本番相当の環境を再現してから検証する計画だったが、後にDinD構成自体が不要と判明したため（詳細はセクション1参照）、ローカルとCloudflare本番の実行方式は完全に一致することになった。そのため、Phase 2ではDockerを一切使わず、T1-3で実装したサーバーと同じロジック（`config.toml`生成 + `openhands --headless`起動）を手動コマンドで再現して検証する。

この構成により、Phase 2で検証した内容の信頼性が高まっている。ローカル検証用に別のモード（`RUNTIME=local`等）を使うのではなく、本番と全く同じ呼び出し方を検証するため、Phase 3でのCloudflareデプロイ後に「ロジックは合っていたはずなのに環境差異で動かない」という事態が起きにくい設計になっている。

### T2-0　【最優先】Kimi K2.7 CodeのPreserved Thinking要件の互換性確認（Moonshot直接 vs OpenRouter経由の比較）

**目的**: kimi-k2.7-codeは`thinking.keep`が`"all"`固定（無効化不可）であり、マルチターンのツール呼び出しでは過去のアシスタントメッセージの`reasoning_content`を会話履歴にそのまま保持して送り返す必要がある。この要件をOpenHandsが正しく処理できているかを、**Moonshot直接接続とOpenRouter経由接続の両方で検証・比較**し、より安定する経路を暫定的な標準構成として採用する。

> **追加調査での発見**: LiteLLM（OpenHandsが内部で使用するライブラリ）は、過去に`kimi-k2.5`, `kimi-k2.6`のリリース時、この`reasoning_content`保持の対応漏れにより400 Bad Requestエラーが発生する不具合を繰り返し起こしている（[litellm#21672](https://github.com/BerriAI/litellm/issues/21672), [litellm#26156](https://github.com/BerriAI/litellm/issues/26156)）。新モデルリリースのたびに、LiteLLM側の対応表(`model_prices_and_context_window.json`)への追加登録が追いついていない、というパターンが繰り返されている。
>
> 一方、OpenRouterは提供モデルの説明ページで「thinking modeにおいて全ての推論内容をマルチターン間で保持する」処理を自社側（プロバイダ側）で担っていると明記している。これが事実であれば、LiteLLM側の対応漏れをOpenRouterが吸収してくれる可能性があり、Moonshot直接接続より安定する可能性がある。**ただしこれは実測で確認していない仮説であり、本タスクで検証する。**

**将来のマルチモデルオーケストレーションとの関係**: この検証はT1-3bで実装したプロバイダ抽象化（`llmProvider`フィールド）を使って行う。ここで得られる知見（どちらの経路が安定するか、レイテンシ・料金の実測差）は、将来的に複数モデルを使い分けるオーケストレーション層を設計する際の判断材料としてそのまま活用する。

**作業項目**
- T1-3bで実装したプロバイダ切り替え機能を使い、`llmProvider: "moonshot"`と`llmProvider: "openrouter"`の両方で同一タスクを実行できるようにする
- OpenRouterのAPIキーを取得する（https://openrouter.ai/ でアカウント登録・キー発行）
- OpenHandsが依存するLiteLLMのバージョンを確認する（`uv tool install openhands`でインストールされた環境内で`pip show litellm`相当のコマンドを実行）
- 意図的に2ターン以上のツール呼び出しが発生するタスク（例: 「ファイルを1つ読んでから、別のファイルを編集して」のように複数手順を要する指示）を用意する
- 同一タスクを、Moonshot直接接続・OpenRouter経由接続の両方で実行し、結果を比較する

**検証方法**
- 両経路について、2ターン目以降のツール呼び出しで`400 Bad Request`や`reasoning_content is missing`といったエラーが発生しないことを確認する
- 両経路が問題なく動作する場合、以下の観点で比較記録を残す:
  - レイテンシ（タスク完了までの所要時間）
  - 実際の課金額（トークン消費量 × 各経路の単価）
  - `tool_choice`制約（`auto`/`none`のみ）がOpenRouter経由でも同様に適用されるか
- どちらか一方でエラーが発生する場合、以下を順に試す:
  1. `uv tool upgrade openhands`で最新版に更新してから再試行
  2. モデルを`kimi-k2.6`に一時的に切り替えて同様のテストを行い、問題がKimi K2.7固有かLiteLLM全般の問題かを切り分ける
  3. 両経路とも問題がある場合、LiteLLMのバージョンを個別に固定・更新することを検討する（OpenHandsの依存関係管理次第で可否が変わるため、要調査）
- 両経路とも安定する場合は、コスト・レイテンシの実測結果をもとに暫定の標準プロバイダを決定し、`LLM_PROVIDERS`のデフォルト値（T1-3b参照）に反映する

**成果物**: Moonshot直接・OpenRouter経由それぞれのマルチターン動作確認ログ、比較結果のメモ（レイテンシ・料金・安定性）、（問題があった場合）回避策の記録

**この検証で両経路とも問題が見つかった場合、T2-1以降の作業を中断し、まずこの問題への対処を優先すること。**

**成果物**: マルチターン動作確認ログ、（問題があった場合）回避策の記録

**この検証で問題が見つかった場合、T2-1以降の作業を中断し、まずこの問題への対処を優先すること。**

---

### T2-1　OpenHandsのローカルインストールと動作確認

**目的**: T1-3で実装したサーバーロジック（`config.toml`動的生成 + `openhands --headless`起動）と同じ手順を手動で再現し、OpenHands headlessモードとKimi K2.7 Codeの接続、プロンプト内容、PR作成までの一連のロジックを検証する

> **設計変更**: 当初`RUNTIME=local`環境変数によるDockerサンドボックス回避を計画していたが、DinD構成自体を廃止したことで、Cloudflare本番環境（T1-3のサーバー実装）もサンドボックスなしで直接実行する方式に統一された。そのため、ローカル検証も`RUNTIME=local`という特別なモードを使わず、**T1-3の実装と全く同じ手順**（`config.toml`生成 + `openhands --headless`起動）で行う。これにより、Phase 2で検証した内容がそのままPhase 3の本番環境の挙動と一致することが保証される。

**作業項目**
- ローカル環境に Python 3.12以上をインストール（未導入の場合）
- `uv tool install openhands --python 3.12` でOpenHands CLI（v1系）をインストール
- 検証用の小規模プライベートリポジトリを用意し、ローカルに`git clone`する
- 簡単な実装タスク（例: READMEに1行追加する程度）をIssueとして作成する
- T1-4で作成した`buildPrompt()`が出力する形式のプロンプトを手動で組み立てる
- T1-3のサーバーが行うのと同じ手順で`$HOME/.openhands/config.toml`を作成する（下記参考コマンド参照）
- クローン済みディレクトリをカレントディレクトリとして`openhands --headless --json --override-with-envs -t "<プロンプト>"`を実行する

**検証方法**
- 対象リポジトリに新しいブランチとPull Requestが作成されていることを確認
- PR内容がIssueの指示に沿っていることを確認
- 実行ログにエラーが出ていないか確認
- Kimi APIの利用トークン数をレスポンス・ログから記録し、コスト試算の実測値とする
- `config.toml`のLLM接続設定（`model = "openai/kimi-k2.7-code"`, `base_url = "https://api.moonshot.ai/v1"`）が正しく機能することを確認
- `max_iterations`の設定が実際に反映されていることを確認（意図的に小さい値を設定し、上限に達した場合の挙動を見る）

**成果物**: ローカルでの動作確認ログ、実測トークン消費量データ

**参考コマンド**

```bash
# uv経由でのインストール(Python 3.12+, uv 0.11.6+が必要)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install openhands --python 3.12

# 検証用リポジトリをクローン
git clone https://github.com/<owner>/<repo>.git /tmp/kimi-test-workdir
cd /tmp/kimi-test-workdir

# T1-3のサーバーと同じ内容のconfig.tomlを、タスク専用のHOMEに作成
export TASK_HOME=/tmp/kimi-test-home
mkdir -p "$TASK_HOME/.openhands"
cat > "$TASK_HOME/.openhands/config.toml" << 'EOF'
[core]
max_iterations = 20
max_budget_per_task = 0.0

[llm]
model = "openai/kimi-k2.7-code"
base_url = "https://api.moonshot.ai/v1"
api_key = "<KIMI_API_KEY>"
EOF

# GitHub操作用トークンを環境変数で渡し、HOMEをタスク専用ディレクトリに向けて実行
export GITHUB_TOKEN="<GITHUB_TOKEN>"
export HOME="$TASK_HOME"
export OPENHANDS_SUPPRESS_BANNER=1

openhands --headless --json --override-with-envs \
  -t "READMEに1行追加してPRを作成して" \
  > openhands-output.jsonl
```

**OpenRouter経由で試す場合**（T2-0の比較検証用）、`config.toml`の`[llm]`セクションのみ以下に差し替える。

```toml
[llm]
model = "openrouter/moonshotai/kimi-k2.7-code"
base_url = "https://openrouter.ai/api/v1"
api_key = "<OPENROUTER_API_KEY>"
```

`--json`でJSONL形式のイベントストリームを出力できるため、後続のログ解析（T1-3のサーバー実装が期待するログ形式との整合確認）にも活用する。

---

### T2-2　異常系の確認（ロジックレベル）

**目的**: 実装が困難なIssueやAPIエラー時の挙動を確認し、失敗ハンドリングを検証する

**作業項目**
- 曖昧または実装不可能なIssue（情報不足）を用意し、OpenHandsの挙動を観察する
- 意図的に不正なAPIキーを設定し、エラーレスポンスの内容を確認する
- `--max-iterations` の上限に達した場合の挙動を確認する

**検証方法**
- 変更が生成されない場合でもプロセスが異常終了せず、非0の終了コードで正常に終了することを確認する
- エラー内容がログに十分な情報として残ることを確認する
- T1-3で実装したタスク実行サーバーのエラーハンドリング（`exitCode`と`log`を含むJSONレスポンス）が、この異常系でも正しく機能することを合わせて確認する

**成果物**: 異常系挙動のメモ、必要に応じたプロンプト・エラーハンドリングの修正

---

## 5. Phase 3: Cloudflare Worker/Containerデプロイ

### T3-1　wrangler設定ファイル作成

**目的**: Worker・Container・Durable Objectの構成を `wrangler.jsonc` に定義する

**作業項目**
- `containers`設定にDockerfileパス、`instance_type`（vCPU/メモリ/ディスク）、`max_instances`を定義
- `durable_objects`設定に`OpenHandsContainer`クラスをバインド
- `migrations`設定で`new_sqlite_classes`を指定

**検証方法**
- wranglerの設定バリデーション（`wrangler deploy --dry-run` 相当）で構文エラーがないことを確認

**成果物**: `packages/kimi-agent/wrangler.jsonc`

---

### T3-2　Hono製Webhook受信Worker実装

**目的**: GitHub Webhookを受信し、署名検証・ラベルフィルタリング・コンテナ起動を行うWorkerをHonoで実装する

**作業項目**
- `POST /webhook/github` エンドポイントを実装
- `X-Hub-Signature-256`ヘッダーのHMAC-SHA256検証ロジックを実装（Web Crypto API使用）
- `action=labeled` かつ `label.name=kimi-implement` のフィルタリングを実装
- `getContainer()`でIssue番号を含む一意名からコンテナインスタンスを取得し、`/run-task`へリクエストを転送
- 失敗時にGitHub Issueへコメントを投稿する`notifyIssue`関数を実装

**検証方法**
- `wrangler dev`でローカル実行し、curlで模擬Webhookペイロード（署名付き）を送信して200が返ることを確認
- 不正な署名でリクエストした場合に401が返ることを確認
- 対象外のラベル・イベントで200（Ignored）が返り、コンテナが起動しないことを確認

**成果物**: `packages/kimi-agent/src/worker.ts`, `src/OpenHandsContainer.ts`

---

### T3-3　Cloudflare Secretsの登録

**目的**: APIキー等の機密情報をCloudflare Secretsとして安全に登録する

**作業項目**
- `wrangler secret put GITHUB_TOKEN`
- `wrangler secret put KIMI_API_KEY`
- `wrangler secret put WEBHOOK_SECRET`
- `wrangler secret put OPENROUTER_API_KEY`（T2-0の比較検証でOpenRouter経由を採用する場合、または将来のマルチモデル対応のために先行登録しておく）

**検証方法**
- `wrangler secret list` で登録済みシークレット名の一覧を確認（値は表示されないことを確認）

**成果物**: 登録済みCloudflare Secrets

---

### T3-4　初回デプロイと疎通確認

**目的**: Worker・Containerを実際にCloudflareへデプロイし、公開URLでの動作を確認する

**作業項目**
- `packages/kimi-agent` 内で `wrangler deploy` を実行
- デプロイ後のWorker URLを取得
- curlでWorker URLに対して模擬リクエストを送信し、レスポンスを確認

**検証方法**
- Cloudflareダッシュボードでコンテナインスタンスが正常に起動・終了することを確認
- 初回のみ発生するコンテナのプロビジョニング待ち時間を実測する

**成果物**: デプロイ済みWorker（本番URL）

---

### T3-5　Cloudflare実機でのコンテナ動作確認

**目的**: T3-4でデプロイしたコンテナ上で、OpenHands CLIが実際に起動しファイル操作・コマンド実行ができることを確認する

> **設計変更に伴う位置づけの変化**: 当初はDinD固有の制約検証を目的とするタスクだったが、DinD構成自体を廃止したため、本タスクは通常のコンテナデプロイ後動作確認に性格が変わった。念のため独立タスクとして残し、コンテナ環境特有の問題（`node:22-slim`上でのPython/uv/OpenHandsの動作、ファイルパーミッション等）を早期に発見できるようにする。

**作業項目**
- T3-4でデプロイ済みのWorker/Containerに対し、実際に`/run-task`相当のリクエストを送信する（curlによる直接呼び出し、またはT4のWebhook経由）
- Cloudflareダッシュボードでコンテナのログをリアルタイムに確認し、entrypoint.shの`openhands`コマンド確認ログが正しく出力されているか確認する
- OpenHandsの起動に失敗する場合、コンテナ内のPATH設定（`uv tool install`によるインストール先）、ファイルパーミッション（`node`ユーザーでの書き込み権限）を中心に切り分ける

**検証方法**
- コンテナログに `[entrypoint] openhands CLI found` が出力されることを確認
- OpenHandsが実際にリポジトリ内でファイル編集・コマンド実行を行えることを確認（T2-1でローカル検証済みのロジックが、Cloudflare Container環境下でも同様に動作することの確認）
- 失敗した場合はDockerfile・entrypoint.shを修正して再デプロイする

**成果物**: Cloudflare Container環境下での動作確認ログ、（必要に応じて）Dockerfile・entrypoint.shの修正

---

## 6. Phase 4: GitHub連携・E2E検証・運用整備

### T4-1　GitHub Webhook設定

**目的**: 検証対象PJリポジトリにWebhookを設定し、Issueイベントを実際にCloudflare Workerへ送信させる

**作業項目**
- 検証対象PJリポジトリの `Settings > Webhooks` で新規Webhookを追加
- Payload URLにデプロイ済みWorker URLを設定
- Content typeを `application/json` に設定
- SecretにT0-4で生成した`WEBHOOK_SECRET`を設定
- イベントは `Issues` のみを選択

**検証方法**
- GitHub側のWebhook設定画面の「Recent Deliveries」からテスト送信を行い、200レスポンスが返ることを確認

**成果物**: 設定済みGitHub Webhook

---

### T4-2　kimi-implement ラベルの作成

**目的**: トリガー用のラベルを検証対象PJリポジトリに作成する

**作業項目**
- 検証対象PJリポジトリの Labels 設定で `kimi-implement` ラベルを作成（色・説明文を設定）

**検証方法**
- Issue一覧画面でラベルが選択可能になっていることを確認

**成果物**: 作成済みラベル

---

### T4-3　E2E本番検証（実際のIssueでの動作確認）

**目的**: 実際の小規模な実装タスクをIssueとして起票し、ラベル付与からPR作成までの全フローを検証する

**作業項目**
- 軽微な実装タスク（例: 既存関数への簡単なバリデーション追加）をIssueとして作成
- `kimi-implement` ラベルを付与
- Cloudflareダッシュボードでコンテナの起動ログをリアルタイムで確認

**検証方法**
- 数分〜十数分程度でPull Requestが自動作成されることを確認
- PRの内容がIssueの意図を満たしているか人間がレビューする
- 実行にかかったコンテナ稼働時間とKimi APIトークン消費量を記録し、コスト試算の実測値と比較する

**成果物**: E2E検証済みログ、実測コストデータ

---

### T4-4　監視・アラート設定

**目的**: 失敗の検知と可視化のための最低限の監視を整備する

**作業項目**
- `wrangler.jsonc` の`observability`設定を有効化し、Cloudflareダッシュボードでログを閲覧可能にする
- 必要であれば失敗時のSlack通知等を追加検討する（個人検証段階では必須ではない）

**検証方法**
- 意図的に失敗するタスクを実行し、Issueへの失敗コメントとログ確認が機能することを確認

**成果物**: 観測性設定

---

### T4-5　README・運用ドキュメント最終化

**目的**: セットアップ手順・運用方法をドキュメント化し、再現性を担保する

**作業項目**
- `packages/kimi-agent/README.md` の内容を実際のデプロイ手順と突き合わせて更新
- 既知の制約事項（セッション上限、コスト前提、OpenHands CLIバージョン依存）を明記
- モノレポ内での位置づけ・他PJへの適用方法を追記

**検証方法**
- ドキュメントのみを見て、再現デプロイできるか机上で確認する

**成果物**: `packages/kimi-agent/README.md`（最終版）

---

## 7. Phase 5: マルチモデルオーケストレーションへの拡張（将来フェーズ）

Phase 0〜4で単一モデル（Kimi K2.7 Code）による最小構成が動作した後、複数モデルの使い分け・並行実行への発展を目指す。このフェーズは本計画書時点では詳細タスク分解を行わず、方向性と着手条件を記録するに留める。system_design.md 3.7で定義した3段階の発展計画に対応する。

### 着手条件

- Phase 0〜4が完了し、Kimi K2.7 Code単体でのIssue駆動実装フローが安定稼働していること
- T2-0での比較検証により、最低1つの安定した接続経路（Moonshot直接またはOpenRouter経由）が確立していること

### 想定タスク（概要、着手時に詳細化する）

| タスク（仮） | 内容 |
|---|---|
| T5-1 | Issueラベルによるモデル振り分けルールの設計（例: `kimi-implement`は現行のKimi、`claude-implement`はClaude系） |
| T5-2 | タスク実行サーバーへのルーティングロジック追加（ラベル名から`llmProvider`/モデル名を決定する） |
| T5-3 | 失敗時フォールバックの実装（1つのモデルでタスクが失敗した場合、別モデルで自動再試行する） |
| T5-4 | 複数モデル・複数コンテナの並行実行の検証（コスト・`max_instances`上限の再試算を含む） |
| T5-5 | 複数モデルの結果比較・統合フローの設計（人間が複数PRから選ぶ運用、またはスコアリングによる自動選別） |

### 検討事項（着手前に整理すべき論点）

- モデルごとのプロンプト最適化の必要性（Kimi向けに調整したpromptBuilder.tsのプロンプトが、他モデルでも同等の精度を出すとは限らない）
- OpenHands以外のエージェント（Kimi Code CLI等のモデル専用ツール）を併用する場合、タスク実行サーバーの抽象化をエージェント単位でも設ける必要が生じる可能性
- 複数コンテナ同時実行時のコスト再試算（現行の月$7〜11という試算は単一モデル・低頻度利用が前提）

---

## 8. リスクと対応方針

| リスク | 影響 | 対応方針 |
|---|---|---|
| OpenHands runtimeイメージのpullに時間がかかる | コールドスタートが長くなり、体感速度が悪化 | 初期段階では許容し、必要であればCloudflareレジストリへの事前ミラーリングを検討 |
| Docker-in-Docker設定の不備でdockerdが起動しない | ~~タスクが全く実行できない~~ | **v1.3で解消**: OpenHands CLI（v1系）はサンドボックスを必須としないアーキテクチャのため、DinD構成自体を廃止した |
| OpenHandsが意図しないコマンドを実行する（自動承認モード） | 予期しない変更・セキュリティリスク | PRベースの運用を徹底し、mainへの直接pushを許可しない。GitHub Tokenの権限を最小化する |
| Kimi APIの料金体系変更 | コスト試算の前提が崩れる | T2-1, T4-3で実測値を記録し、定期的に料金ページを再確認する |
| モノレポ他パッケージへの影響 | workspace設定ミスで他PJのビルドが壊れる | T0-5で既存PJのビルド確認を必須検証項目とする |
| プロジェクト数増加によるスケール限界 | Cloudflare Containersの同時実行数上限に到達、または独立リポジトリ化が必要に | max_instancesを調整、将来的に独立リポジトリへの切り出しを再検討（切り出しコストは低く抑えてある） |
| Phase 2で検証したロジックがCloudflare Container環境下で異なる挙動を示す | ローカルとCloudflare Containerで実行環境（OS、パーミッション等）の差異により挙動が変わる可能性 | T3-5で差異が見つかった場合、環境固有の問題（PATH、パーミッション等）とロジック自体の不具合を区別して切り分け、修正する |
| OpenHands CLI（v1系）の仕様変更に追従できない | CLIフラグ・設定ファイル形式の変更でサーバー実装が動かなくなる | 本設計中にも複数回の仕様確認による修正が発生した実績あり。定期的に公式ドキュメント（docs.openhands.dev）を確認し、バージョンピン（Dockerfileでの`openhands`バージョン固定）を検討する |
| **Kimi K2.7 CodeのPreserved Thinking要件をLiteLLM/OpenHandsが正しく処理できない** | **マルチターンのツール呼び出しが400エラーで失敗し、エージェントループ自体が成立しなくなる** | **T2-0で最優先検証。過去にkimi-k2.5/k2.6で同種の不具合が繰り返し報告されている([litellm#21672](https://github.com/BerriAI/litellm/issues/21672), [litellm#26156](https://github.com/BerriAI/litellm/issues/26156))。問題が見つかった場合はLiteLLM更新、kimi-k2.6への一時切り替え等で切り分ける** |
| Apple Silicon等arm64環境でのDockerビルド | Cloudflare Containersはlinux/amd64必須のため、明示的なplatform指定がないとビルド済みイメージが動作しない | Dockerfileの`FROM`行に`--platform=linux/amd64`を明示済み(v1.4で対応) |
| VPN/Cloudflare Oneクライアントによるビルド失敗 | TLS傍受によりビルド中のHTTPSリクエスト(uvインストーラ等)が証明書エラーで失敗する | ビルド時はVPN/Cloudflare Oneクライアントを一時的に無効化する運用手順をREADMEに明記する |
