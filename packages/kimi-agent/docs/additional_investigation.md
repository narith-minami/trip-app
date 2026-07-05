# 追加調査レポート — 実装済み内容の最新性・整合性チェック

作成日: 2026-07-04
目的: これまでに実装した内容（Dockerfile, entrypoint.sh, server.ts, wrangler構成）および設計判断（DinD廃止）について、Cloudflare Containers / Kimi K2.7 Code / OpenHandsの3領域を個別に再調査し、公式リファレンス・コミュニティ報告との整合性を検証する。

**結論を先に述べると、1件の重大リスク（要対応）と数件の中程度の考慮漏れが見つかった。**

---

## 🔴 重大リスク: Kimi K2.7 Codeの「Preserved Thinking」とLiteLLM/OpenHands側の対応状況

### 何が問題か

Kimi公式ドキュメントに明記されている制約:

> kimi-k2.7-code では Preserved Thinking が常時有効(`thinking.keep`は`"all"`固定、無効化不可)。マルチターンのツール呼び出しでは、**過去のすべてのアシスタントメッセージの`reasoning_content`をそのまま会話履歴に保持して送り返す**必要があり、怠ると400エラーになる。

参照: https://platform.kimi.ai/docs/guide/use-kimi-k2-thinking-model

### なぜ本プロジェクトにとって致命的になりうるか

本システムの核心は、OpenHandsが「ファイル編集→テスト実行→修正」を何度も繰り返すマルチターンのエージェントループです。この`reasoning_content`保持要件を満たせない場合、**タスクが数ターン目で必ず失敗する**ことになります。

### 裏付けとなる報告（LiteLLM issue tracker）

同種の問題が過去に繰り返し発生しています。

| モデル | issue | 状態 |
|---|---|---|
| kimi-k2.5 | https://github.com/BerriAI/litellm/issues/21672 | PR #23580で修正済み |
| kimi-k2.6 | https://github.com/BerriAI/litellm/issues/26156 | `model_prices_and_context_window.json`に未登録のため`supports_reasoning`が`False`のまま → 未修正の報告あり |
| kimi-k2.5 (別報告) | https://github.com/BerriAI/litellm/issues/23765 | クローズ済みだが再発報告 |

**パターンとして明確なのは、Moonshotが新モデルをリリースするたびに、LiteLLM側の対応表(`model_prices_and_context_window.json`)への追加登録が追いついていない、という繰り返し**です。`kimi-k2.7-code`について同種のissueがLiteLLM側に上がっているかは本調査時点で確認できていません（新しすぎて未報告の可能性が高い）。

similarな問題は他のクライアントでも報告されています:
- Strands Agents SDK: https://github.com/strands-agents/sdk-python/issues/1150
- Open WebUI: https://github.com/open-webui/open-webui/issues/23175
- nanobot: https://github.com/HKUDS/nanobot/issues/390

つまりこれは「LiteLLM固有のバグ」ではなく、**OpenAI互換クライアント全般が抱えがちな構造的な問題**（reasoning_contentを会話履歴の再構築時に保持し損ねる）です。OpenHands自身がこの問題を回避できているかは、本調査だけでは断定できません。

### 対応方針（提案）

1. **T2-1（ローカル検証）で、意図的に2ターン以上のツール呼び出しを発生させるタスクを試し、400エラーが出ないか確認する**（現状の実装計画書のT2-1は1回のタスクで検証を終える想定だったが、マルチターンを明示的に確認する項目を追加すべき）
2. もし400エラーが発生する場合、回避策の候補:
   - LiteLLMのバージョンを最新に上げてから再試行する
   - `pip show litellm` 等でOpenHandsが依存しているLiteLLMバージョンを確認し、`model_prices_and_context_window.json`に`kimi-k2.7-code`が`supports_reasoning: true`で登録されているか確認する
   - 登録されていない場合、暫定的に`kimi-k2.6`にモデルを切り替える（K2.6は少なくとも一部issueで修正実績があるため、K2.7より安定している可能性がある）
   - LiteLLM issue #21672のコメントにある「reasoning_contentが欠落しているアシスタントのtool callメッセージに空文字を注入するカスタムコールバック」という回避策も選択肢に入れる

**この確認は、Phase 2 (T2-1) の実施前に必ず組み込むべき最優先事項として扱う。**

---

## 🟡 中程度の考慮漏れ

### 1. Cloudflare Containers: `linux/amd64`アーキテクチャ必須

公式ドキュメントに明記:
> Your container image must be able to run on the linux/amd64 architecture

参照: https://developers.cloudflare.com/containers/get-started/

**問題**: 開発機がApple Silicon Mac（M1/M2/M3等）の場合、`docker build`はデフォルトでarm64向けにビルドされる。Wranglerが自動でクロスビルドしてくれる保証は見当たらないため、明示的な対応が必要になる可能性がある。

**対応方針**: Dockerfileの`FROM`行を`FROM --platform=linux/amd64 node:22-slim`に変更するか、`docker build --platform linux/amd64`を明示する。T1-1・T3-1の検証項目に追記することを推奨する。

参照: https://nesin.io/blog/x86-x86-amd64-docker-mac

### 2. Cloudflare Containers: VPN/Cloudflare Oneクライアントによるビルド失敗

公式ドキュメントに明記:
> If you are running the Cloudflare One Client or a VPN that performs TLS inspection, HTTPS requests made during the Docker build process may fail with SSL or certificate errors.

参照: https://developers.cloudflare.com/containers/local-dev/

**問題**: 本プロジェクトのDockerfileは`curl -LsSf https://astral.sh/uv/install.sh | sh`や`curl ... github.com/cli/cli/releases`等、ビルド中に複数のHTTPSリクエストを行う。VPNやCloudflare Oneクライアントを使っている開発環境では、これらが失敗する可能性がある。

**対応方針**: 実装計画書のトラブルシューティング項目に「VPN/Cloudflare Oneクライアントを一時的に無効化してビルドを試す」という項目を追加する。

### 3. コールドスタート時間の実態値

第三者記事による実測値（公式一次情報ではない点に注意）:
> 標準的なNode.jsイメージ（200-400MB）: 180-240ms、Alpineベースの軽量イメージ: 約100ms

参照: https://www.digitalapplied.com/blog/cloudflare-containers-dockerized-workloads-edge-330-cities

**注意点**: これは「ウォームでないPoPへの初回リクエスト」の話であり、「コンテナが完全に停止状態から起動しWorkerからの要求に応答できるまでの時間（プロビジョニング）」とは別軸の指標である。公式ドキュメントでは「初回デプロイ後、Containerの準備に数分かかる」という別の記述もあり、両者を混同しないよう注意が必要（後者は初回デプロイ限定、前者は個々のリクエストのレイテンシ）。

### 4. OpenHandsのGitHub連携はCloud版とCLI版で機能が異なる

公式の「GitHub Integration」ページ（https://docs.openhands.dev/openhands/usage/cloud/github-installation）は**OpenHands Cloud（マネージドSaaS）向け**の説明であり、本プロジェクトが使う自己ホスト型CLIとは仕組みが異なる。

**確認できたこと**: CLI版でのgit操作・PR作成は、OpenHandsが持つ汎用的なシェル実行能力（terminal相当のツール）に依存しており、「labelを付けたら自動でPRを作る」という確立された専用機能ではない。本プロジェクトのpromptBuilder.tsが「`gh pr create`を実行し、Closes #番号を含めること」と明示的に指示しているのは、この前提を踏まえると正しいアプローチだが、**GitHub連携の信頼性はプロンプトの指示の明確さに依存する**という点はリスクとして認識しておくべき。

**対応方針**: T2-1・T4-3の検証観点に「PRが確実に作成されない場合がある前提で、失敗時のリトライまたは人間へのエスカレーション手順を明確にする」を追加することを検討する。

### 5. `--headless`モードの位置づけの変遷（誤解を招きやすい情報の整理）

調査中、一見矛盾する情報に遭遇したため、経緯を整理して残す。

- 旧issue（https://github.com/OpenHands/OpenHands/issues/10529）は、**V0時代のheadless mode**（`python -m openhands.core.main`ベース）についての課題提起であり、「Docker必須」「tmuxが必要」「スケーラブルな自動化に向いていない」という欠点が列挙されている
- このissue自体が「Requirements: Should not require docker (already accomplished with current CLI)」と明記しており、**現行のOpenHands CLI（v1系）はこの課題をすでに解決済み**であることが示されている
- 一部の技術記事（2026年4月執筆）では「headless modeはDockerを求める」という記述も見られたが、これは記事執筆時点でV0の情報が混在していた可能性が高い

**結論**: 前回レポートで確定した「V1はサンドボックス任意」という理解に変更はない。ただし、Web上の情報がV0/V1の情報が混在した状態で流通していることは、今後の追加調査時にも起こりうる注意点として明記しておく。

---

## 🟢 確認できた良好な整合性

- `@cloudflare/containers`のバージョン指定（0.3.7）は現行の最新版と一致
- `wrangler.jsonc`の`containers`/`durable_objects`/`migrations`設定形式は最新の公式サンプルと一致
- `sleepAfter`, `defaultPort`等のContainerクラスAPIは現行のAPI仕様と一致
- Kimi K2.7 Codeの`tool_choice`制約（`auto`/`none`のみ）はpromptBuilder.tsの設計判断（デフォルトauto使用）と整合している
- `EXPOSE 8080`の記載はローカル開発（`wrangler dev`）時に必要という公式の注意書きと一致しており、既存のDockerfileはこの点は問題ない
- OpenHands CLIのインストール方法（`uv tool install openhands --python 3.12`）、フラグ（`--headless --json --override-with-envs`）は現行のCLI READMEと一致

---

## ドキュメントへの反映が必要な項目（優先順位順）

| 優先度 | 項目 | 反映先 |
|---|---|---|
| 最優先 | Kimi reasoning_content保持問題の検証をT2-1に追加 | implementation_plan.md |
| 高 | linux/amd64明示的指定 | Dockerfile, system_design.md |
| 中 | VPN/Cloudflare One起因のビルド失敗の対処法 | implementation_plan.md トラブルシューティング |
| 中 | GitHub連携の信頼性がプロンプト依存である旨の明記 | system_design.md セキュリティ設計 or 制約事項 |
| 低 | コールドスタート指標の出典と定義の明確化 | system_design.md コスト設計（参考情報として） |

---

## 参照リンク一覧（本レポートで新たに参照したもの）

- Cloudflare Containers Get Started（linux/amd64要件）: https://developers.cloudflare.com/containers/get-started/
- Cloudflare Containers Local Development（VPN起因のビルド失敗）: https://developers.cloudflare.com/containers/local-dev/
- Cloudflare Containers解説記事（コールドスタート実測値、第三者情報）: https://www.digitalapplied.com/blog/cloudflare-containers-dockerized-workloads-edge-330-cities
- OpenHands headless mode 旧issue（V0時代の課題、解決済みの経緯）: https://github.com/OpenHands/OpenHands/issues/10529
- OpenHands GitHub Integration（Cloud版向け、CLI版とは別物）: https://docs.openhands.dev/openhands/usage/cloud/github-installation
- Kimi Thinking Model使用ガイド（Preserved Thinking要件の一次情報）: https://platform.kimi.ai/docs/guide/use-kimi-k2-thinking-model
- LiteLLM reasoning_content issue（K2.5）: https://github.com/BerriAI/litellm/issues/21672
- LiteLLM reasoning_content issue（K2.6、未修正の可能性）: https://github.com/BerriAI/litellm/issues/26156
- LiteLLM reasoning_content issue（K2.5、再発報告）: https://github.com/BerriAI/litellm/issues/23765
- 同種問題（Strands Agents SDK）: https://github.com/strands-agents/sdk-python/issues/1150
- 同種問題（Open WebUI）: https://github.com/open-webui/open-webui/issues/23175
- 同種問題（nanobot）: https://github.com/HKUDS/nanobot/issues/390
- LiteLLM公式 Reasoning Content ドキュメント: https://docs.litellm.ai/docs/reasoning_content
