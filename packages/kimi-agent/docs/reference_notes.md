# 参照リファレンス集 — Cloudflare Containers / Kimi K2.7 Code / OpenHands

作成日: 2026-07-04
用途: Kimi Issue-Driven Coding Agent の設計・実装にあたり調査した一次情報の整理。今後の仕様変更時の再調査や、他メンバーへの引き継ぎを想定。

---

## 目次

1. [Cloudflare Containers](#1-cloudflare-containers)
2. [Kimi K2.7 Code（Moonshot AI）](#2-kimi-k27-codemoonshot-ai)
3. [OpenHands](#3-openhands)
4. [OpenHands V0→V1移行に関する注意（重要）](#4-openhands-v0v1移行に関する注意重要)

---

## 1. Cloudflare Containers

### 1.1 概要・基本ドキュメント

Cloudflare Workers上でDockerコンテナイメージをオンデマンドで起動できる機能。「Region:Earth」を謳い、Workerからのコードで起動・停止・スケーリングを制御する。

- **公式ドキュメントトップ**: https://developers.cloudflare.com/containers/
- **Get Started（初回デプロイ手順）**: https://developers.cloudflare.com/containers/get-started/
- **FAQ**: https://developers.cloudflare.com/containers/faq/
- **公式リポジトリ（`@cloudflare/containers`パッケージ）**: https://github.com/cloudflare/containers
- **npmパッケージ**: https://www.npmjs.com/package/@cloudflare/containers（本調査時点の最新版: 0.3.7）

### 1.2 料金体系

CPU課金は2025年11月に「プロビジョニング量」から「実利用量ベース」に変更された。この変更は本プロジェクトのコスト試算の前提として重要。

- **料金ページ**: https://developers.cloudflare.com/containers/pricing/
- **CPU課金変更のChangelog**: https://developers.cloudflare.com/changelog/2025-11-21-new-cpu-pricing/
- **Cloudflare Community解説**: https://community.cloudflare.com/t/containers-new-cpu-pricing-for-containers-and-sandboxes/860087

料金の要点:

| 項目 | 単価 | 無料枠 |
|---|---|---|
| メモリ | $0.0000025/GiB秒 | 25 GiB時間/月 |
| CPU（実利用ベース） | $0.000020/vCPU秒 | 375 vCPU分/月 |
| ディスク | $0.00000007/GB秒 | 200 GB時間/月 |
| 前提プラン | Workers Paid Plan $5/月 | — |

### 1.3 Container クラス（`@cloudflare/containers`）の使い方

WorkerからDurable Object経由でコンテナのライフサイクルを制御するための公式SDK。

- **Container Package（インストール・基本API）**: https://developers.cloudflare.com/containers/container-package/
- **Container Interface（`onStart`/`onStop`/`sleepAfter`等のライフサイクルフック）**: https://developers.cloudflare.com/containers/container-class/

主要な設定例（本プロジェクトの`OpenHandsContainer`実装で参照）:

```typescript
import { Container, getContainer } from '@cloudflare/containers';

export class MyContainer extends Container {
  defaultPort = 8080;
  sleepAfter = '10m'; // アイドル10分でスリープ
}
```

### 1.4 wrangler.jsonc 設定

コンテナ・Durable Object・migrationsの記述形式。

- **Wrangler Configuration リファレンス**: https://developers.cloudflare.com/workers/wrangler/configuration/
- **Workers docs内のContainers設定例**: https://developers.cloudflare.com/containers/（トップページ内にサンプルあり）

設定例（本プロジェクトの`wrangler.jsonc`で採用した形式）:

```jsonc
{
  "name": "container-starter",
  "main": "src/index.js",
  "compatibility_date": "2026-07-02",
  "containers": [
    { "class_name": "MyContainer", "image": "./Dockerfile", "max_instances": 5 }
  ],
  "durable_objects": {
    "bindings": [{ "class_name": "MyContainer", "name": "MY_CONTAINER" }]
  },
  "migrations": [{ "new_sqlite_classes": ["MyContainer"], "tag": "v1" }]
}
```

> **注意（モノレポ環境）**: pnpm workspace等のモノレポ構成では、`wrangler deploy`実行時に「Auto-configuration of projects inside workspaces is limited」という警告が出ることを実機で確認済み。`wrangler.jsonc`を明示的に用意することで回避できる。
> 参照: https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/#workspaces

### 1.5 Docker-in-Docker（DinD）サポート

本プロジェクトでは最終的に不採用となったが、調査時点でCloudflare ContainersがDinDをサポートしていることを確認した記録として残す。

- **Docker-in-Docker実行ガイド（Cloudflare Sandbox SDK docs）**: https://developers.cloudflare.com/sandbox/guides/docker-in-docker/
- **DinDサポート追加のChangelog（2026年2月17日）**: https://developers.cloudflare.com/changelog/2026-02-17-docker-in-docker/
- **Cloudflare Community告知**: https://community.cloudflare.com/t/containers-docker-in-docker-support-added-to-containers-and-sandboxes/893948

DinD利用時の制約（不採用の判断理由）:

- rootlessモードのみ対応（`docker:dind-rootless`ベースイメージが必須）
- `--iptables=false --ip6tables=false`が必須（ネットワーク分離機能が使えない）
- 内部コンテナ間通信には`--network=host`が必要

> 本プロジェクトでは、OpenHands CLI（v1系）がサンドボックスコンテナを必須としないアーキテクチャであることが判明したため、DinD自体を不採用とした（詳細はセクション4参照）。

### 1.6 類似サービスとの比較で参照した情報

選定過程で比較したCloudflare Containers以外のサンドボックス基盤に関する参照情報。

- **Vercel Sandbox（不採用の理由となったセッション上限45分の記載）**: https://fast.io/resources/best-code-execution-sandboxes-ai-agents/
- **AIサンドボックス各社比較（Northflank記事）**: https://northflank.com/blog/ai-sandbox-pricing
- **サンドボックス各社比較（Better Stack Community）**: https://betterstack.com/community/comparisons/best-sandbox-runners/

---

## 2. Kimi K2.7 Code（Moonshot AI）

### 2.1 モデル概要・公式情報

- **Kimi API プラットフォーム（公式クイックスタート）**: https://platform.kimi.ai/docs/guide/kimi-k2-7-code-quickstart
- **Kimi公式リソースページ**: https://www.kimi.com/resources/kimi-k2-7-code
- **Hugging Face モデルカード**: huggingface.co/moonshotai/Kimi-K2.7-Code（本文中で言及、直接アクセスは未実施）

モデル仕様の要点:

| 項目 | 値 |
|---|---|
| リリース日 | 2026年6月12日 |
| アーキテクチャ | MoE, 1T総パラメータ / 32B活性化パラメータ |
| コンテキストウィンドウ | 256K（262,144トークン） |
| ライセンス | Modified MIT |
| thinkingモード | 常時有効（non-thinking非対応） |

### 2.2 料金体系

- **Kimi API 料金ページ**: https://platform.kimi.ai/docs/pricing/chat-k27-code
- **Kimi公式 料金解説**: https://www.kimi.com/resources/kimi-k2-7-code-pricing
- **サードパーティ集計（Requesty）**: https://www.requesty.ai/models/tencent/kimi-k2.7-code
- **サードパーティ集計（OpenRouter）**: https://openrouter.ai/moonshotai/kimi-k2.7-code

料金の要点（Moonshot公式レート）:

| 項目 | 単価（100万トークンあたり） |
|---|---|
| 入力（キャッシュミス） | $0.95 |
| 入力（キャッシュヒット） | $0.19 |
| 出力（標準） | $4.00 |
| 出力（HighSpeed版） | $8.00 |

### 2.3 ベンチマーク・第三者評価

- **独立分析記事（DigitalApplied）**: https://www.digitalapplied.com/blog/kimi-k2-7-code-release-open-source-coding-model
- **ベンチマーク詳細解説（Kingy AI）**: https://kingy.ai/ai/kimi-k2-7-code-benchmarks-specs/
- **モデル解説（kimik2ai.com）**: https://kimik2ai.com/k2.7/

主要ベンチマーク結果（Moonshot公式・vendor-reported）:

- Kimi Code Bench v2: 対K2.6比 +21.8%（62.0 vs 50.9）
- MCP Mark Verified: 81.1（Claude Opus 4.8の76.4を上回る）
- Program Bench: 対K2.6比 +11.0%
- MLS Bench Lite: 対K2.6比 +31.5%

> 上記はすべてMoonshot社の自社ベンチマークであり、独立検証はまだ限定的である点に留意（記事中でも "prove it on neutral ground" という評価スタンスが繰り返し言及されている）。

### 2.4 API互換性・接続方法

OpenAI互換API形式で提供されており、`base_url`の変更のみで既存のOpenAI SDKベースの実装に組み込める。

- 参照: 上記2.1の公式クイックスタートページに実装例あり
- 接続設定（本プロジェクトで採用）:

```
base_url: https://api.moonshot.ai/v1
model: openai/kimi-k2.7-code (LiteLLM形式) または kimi-k2.7-code (Kimi API直接呼び出し時)
```

---

## 3. OpenHands

### 3.1 プロジェクト概要・GitHubリポジトリ

- **メインリポジトリ**: https://github.com/OpenHands/OpenHands
- **公式ドキュメントトップ**: https://docs.openhands.dev/
- **開発ガイド（Development.md）**: https://github.com/OpenHands/OpenHands/blob/main/Development.md

### 3.2 OpenHands CLI（現行v1系）

**最重要**: OpenHands CLIは独立したリポジトリ・PyPIパッケージとして提供されている。旧世代（`openhands-ai`パッケージ、V0アーキテクチャ）と混同しないこと。

- **OpenHands CLI 専用リポジトリ**: https://github.com/OpenHands/OpenHands-CLI
- **CLI README**: https://github.com/OpenHands/OpenHands-CLI/blob/main/README.md
- **PyPIパッケージ（正しいパッケージ名: `openhands`）**: https://pypi.org/project/openhands/
- **CLI Releases（バージョン履歴）**: https://github.com/OpenHands/OpenHands-CLI/releases

インストール方法（公式推奨）:

```bash
uv tool install openhands --python 3.12
```

（`pip install openhands-ai`は旧世代のV0 SDKであり非推奨）

### 3.3 コマンドリファレンス

- **Command Reference（公式）**: https://docs.openhands.dev/openhands/usage/cli/command-reference
- **CLI利用ガイド（サードパーティ、実機検証込みの詳細な解説）**: https://www.glukhov.org/ai-devtools/openhands/
- **Headless mode 利用チュートリアル**: https://openclawhub.tools/tutorial/how-to-use-openhands-cli-headless-mode-for-scriptable-repo-fixes/

主要フラグ（`openhands --help`相当、検証で確定した内容）:

| フラグ | 用途 |
|---|---|
| `--headless` | 非対話モードでの実行（CI/自動化向け） |
| `--json` | JSONL形式でイベントストリームを出力 |
| `--override-with-envs` | 環境変数によるLLM設定の上書きを一時的に有効化（永続化されない） |
| `-t "<プロンプト>"` | タスク内容を指定 |
| `--resume <id>` | 過去の会話を再開 |

> **注意**: `--max-iterations`, `--model`, `--workspace`, `--sandbox`といったフラグは**存在しない**。これらは他のAIエージェントがOpenHandsのドキュメントを生成する際にhallucinateしたフラグとして、コミュニティ内で明示的に指摘されている。
> 参照: https://github.com/NousResearch/hermes-agent/pull/32261（該当PRの説明文で詳細に経緯が記載されている）

### 3.4 設定ファイル（config.toml）

環境変数がデフォルトで無視される仕様のため、自動化用途では`config.toml`によるLLM設定・反復回数上限の指定が実質必須となる。

- **config.template.toml（公式テンプレート）**: https://github.com/OpenHands/OpenHands/blob/main/config.template.toml
- **max_iterations関連の既知の不具合報告**: https://github.com/OpenHands/OpenHands/issues/9344
- **反復回数上限到達時の挙動報告**: https://github.com/OpenHands/OpenHands-CLI/issues/104

設定ファイルの配置場所: `$HOME/.openhands/config.toml`

設定例（本プロジェクトで採用した内容）:

```toml
[core]
max_iterations = 80
max_budget_per_task = 0.0

[llm]
model = "openai/kimi-k2.7-code"
base_url = "https://api.moonshot.ai/v1"
api_key = "<APIキー>"
```

### 3.5 サードパーティによる実装解説・統合事例

- **Hermes Agent（Nous Research）によるOpenHands統合スキル定義**: https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/autonomous-ai-agents/autonomous-ai-agents-openhands
  - `openhands --help`（CLI 1.16.0）に対して実際に検証した上でフラグ一覧を整理しており、本調査で「存在しないフラグ」を特定する際の重要な裏付け情報となった
- **OpenHands V1アーキテクチャの技術解説（DEV Community）**: https://dev.to/truongpx396/openhands-deep-dive-build-your-own-guide-1al0
- **DeepWiki（AIによる自動生成コードベース解説、V0/V1双方に言及）**: https://deepwiki.com/OpenHands/OpenHands

---

## 4. OpenHands V0→V1移行に関する注意（重要）

本プロジェクトの設計を大きく転換させる決定打となった情報。今後別の調査を行う際も、まずこの区別を確認すること。

### 4.1 アーキテクチャ刷新の一次情報

- **The OpenHands Software Agent SDK 論文（arXiv, 2025年11月5日）**: https://arxiv.org/html/2511.03690v1
  - V0→V1移行の設計思想が最も体系的にまとめられている一次情報。"Optional isolation, not mandatory sandboxing"という原則がここで明記されている
- **Runtime Architecture（公式ドキュメント、V0の説明が主）**: https://docs.openhands.dev/openhands/usage/architecture/runtime
- **Sandbox Configuration（DeepWiki、V0とV1双方の設定方式を対比）**: https://deepwiki.com/OpenHands/OpenHands/5.4-sandbox-configuration
- **QEMU microVMランタイム提案issue（V0のDocker依存に関する課題認識）**: https://github.com/OpenHands/OpenHands/issues/13203
  - 「V1 CLIはデフォルトでワークステーション上に直接実行される」という記述が明記されている、本プロジェクトの方向転換の直接的な根拠

### 4.2 V0とV1の違い（本調査で整理した要点）

| 観点 | V0（レガシー） | V1（現行） |
|---|---|---|
| PyPIパッケージ名 | `openhands-ai` | `openhands` |
| 呼び出し方 | `python -m openhands.core.main` | `openhands --headless` |
| サンドボックス | 必須（Docker前提） | 任意（デフォルトはホスト上で直接実行） |
| 反復回数上限の指定 | 環境変数等（複数の指定方法が存在） | `config.toml`の`[core] max_iterations`のみ |
| 環境変数によるLLM設定 | 有効 | デフォルト無視、`--override-with-envs`で一時上書き可 |
| アーキテクチャ概念 | AgentController + Runtime | Agent / Conversation / Workspace / Event |

### 4.3 本プロジェクトへの影響

この区別を見落としていたため、当初（v1.0〜v1.2の設計）はDocker-in-Docker構成を前提にしていたが、v1.3で全面的に設計を修正した。詳細な変更履歴は実装計画書・システム設計書（本プロジェクトの別ドキュメント）を参照。

---

## 付録: 情報の鮮度について

本レポート作成時点（2026年7月4日）の情報である。特に以下の点は変化しやすいため、実装・運用時に再確認することを推奨する。

- Kimi K2.7 Codeの料金・ベンチマークスコア（vendor-reportedであり独立検証が進行中）
- OpenHands CLIのバージョンアップに伴うフラグ・設定ファイル形式の変更
- Cloudflare Containersの料金体系（2025年11月に一度変更されている実績あり）
- Cloudflare ContainersのDinDサポートはベータ機能であり、正式版移行時に仕様が変わる可能性がある
