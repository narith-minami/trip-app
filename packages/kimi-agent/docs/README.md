# Kimi Issue-Driven Coding Agent

GitHub Issue に `kimi-implement` ラベルを付けるだけで、[OpenHands](https://github.com/OpenHands/OpenHands)（OSS コーディングエージェント）と [Kimi K2.7 Code](https://platform.kimi.ai)（Moonshot AI のオープンモデル）が自動で実装を行い、Pull Request を作成します。

GitHub Actions を使わず、**Cloudflare Containers** 上でイベント駆動・使い捨て実行することで、アイドル時のインフラコストをほぼゼロに抑えています。

```
Issue に "kimi-implement" ラベル付与
        │
        ▼
GitHub Webhook → Cloudflare Worker (Hono)
        │
        ▼
Cloudflare Container 起動（Docker-in-Docker）
        │
        ├─ OpenHands (headless) が Issue を解析
        ├─ Kimi K2.7 Code で実装・テスト実行
        │
        ▼
Pull Request 自動作成（Closes #issue番号）
```

---

## 特徴

- **サーバーレス・使い捨て実行**: タスクがない時間はコンテナが起動せず、課金が発生しない
- **OSS + オープンモデル**: OpenHands（MIT License）と Kimi K2.7 Code（Modified MIT）の組み合わせで、モデル利用コストを最小化
- **フル TypeScript**: Worker・コンテナ内サーバーともに TypeScript / Hono で統一
- **既存レビューフローに合流**: 生成物は必ず Pull Request として提出され、人間のレビューを経てマージされる

## 対象タスクの目安

| 想定タスク | 対応可否 |
|---|---|
| バグ修正、小規模な機能追加 | ◎ |
| 1〜数ファイルの機能実装 | ◎（メインターゲット） |
| マルチファイルにまたがる大規模リファクタ | △（スコープ外、別途人間対応を推奨） |
| 1時間を超える長時間セッションが前提のタスク | △（Cloudflare Containers のアイドル検知・実行時間コストの観点から非推奨） |

---

## アーキテクチャ

```
┌─────────────┐   labeled event    ┌──────────────────────┐
│ GitHub Issue │ ─────────────────► │ GitHub Webhook         │
└─────────────┘                    └───────────┬────────────┘
                                                │ POST (HMAC署名付き)
                                                ▼
                              ┌────────────────────────────────┐
                              │ Cloudflare Worker (Hono)          │
                              │  - 署名検証                        │
                              │  - ラベルフィルタリング              │
                              │  - コンテナ起動（Durable Object）    │
                              └───────────┬────────────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │ Cloudflare Container                        │
                    │  ┌────────────────────────────────────┐  │
                    │  │ dockerd (rootless)                    │  │
                    │  │   └─ OpenHands (headless)              │  │
                    │  │        └─ sandbox runtime container    │  │
                    │  │             (Kimi K2.7 Code で実装)     │  │
                    │  └────────────────────────────────────┘  │
                    └───────────┬──────────────────────────────────┘
                                │ git push + gh pr create
                                ▼
                    ┌───────────────────────┐
                    │ Pull Request 自動作成    │
                    └───────────────────────┘
```

詳細は [`docs/system_design.docx`](./docs/system_design.docx) を参照してください。

---

## セットアップ

### 前提条件

- Node.js 22.19.0 以上
- Docker Desktop（または Colima 等、`wrangler deploy` のイメージビルドに必要）
- Cloudflare アカウント（Workers Paid Plan、$5/月）
- Moonshot AI（Kimi）API キー（[platform.kimi.ai](https://platform.kimi.ai)で取得）
- 対象リポジトリへの `contents:write` / `pull_requests:write` / `issues:write` 権限を持つ GitHub Fine-grained PAT

### 1. リポジトリのクローンと依存インストール

```bash
git clone <このリポジトリのURL>
cd kimi-issue-agent
npm install
```

### 2. Wrangler ログイン

```bash
npx wrangler login
```

### 3. シークレットの登録

```bash
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put KIMI_API_KEY
npx wrangler secret put WEBHOOK_SECRET
```

`WEBHOOK_SECRET` はランダムな文字列で構いません。以下で生成できます。

```bash
openssl rand -hex 32
```

### 4. デプロイ

```bash
npx wrangler deploy
```

初回デプロイ後、Cloudflare がコンテナイメージをビルド・プッシュするため数分かかります。デプロイ完了後に表示される Worker URL を控えておいてください。

### 5. GitHub Webhook の設定

対象リポジトリの `Settings > Webhooks > Add webhook` で以下を設定します。

| 項目 | 値 |
|---|---|
| Payload URL | デプロイ済み Worker の URL + `/webhook/github` |
| Content type | `application/json` |
| Secret | 手順3で設定した `WEBHOOK_SECRET` と同じ値 |
| イベント | `Issues` のみ選択 |

### 6. ラベルの作成

対象リポジトリに `kimi-implement` ラベルを作成します。

```bash
gh label create kimi-implement --description "Kimi Code による自動実装トリガー" --color "5319E7"
```

### 7. 動作確認

適当な Issue を作成し、`kimi-implement` ラベルを付与してください。数分〜十数分後、Pull Request が自動作成されます。

---

## ディレクトリ構成

```
.
├── src/
│   ├── worker.ts              # Hono製 Webhook受信 & コンテナ起動制御
│   └── OpenHandsContainer.ts  # Durable Object（コンテナライフサイクル管理）
├── container/
│   ├── Dockerfile             # DinD対応ベースイメージ
│   ├── entrypoint.sh          # dockerd起動 & タスクサーバー起動
│   ├── server.ts              # OpenHands headlessを起動するHTTPサーバー
│   ├── promptBuilder.ts       # Issue内容からプロンプトを構築
│   └── package.json
├── docs/
│   ├── system_design.docx     # システム設計書
│   └── implementation_plan.docx # 実装計画書
├── wrangler.jsonc
└── README.md
```

---

## 設定リファレンス

### 環境変数（コンテナ内・OpenHands用）

| 変数名 | 説明 | 値の例 |
|---|---|---|
| `LLM_MODEL` | 使用するLLM（LiteLLM形式） | `openai/kimi-k2.7-code` |
| `LLM_BASE_URL` | Kimi APIのエンドポイント | `https://api.moonshot.ai/v1` |
| `LLM_API_KEY` | Kimi APIキー | (Cloudflare Secretsから注入) |
| `SANDBOX_SELECTED_REPO` | 対象リポジトリ | `owner/repo-name` |
| `GITHUB_TOKEN` | GitHub操作用トークン | (Cloudflare Secretsから注入) |
| `SANDBOX_RUNTIME_CONTAINER_IMAGE` | OpenHandsサンドボックスのランタイムイメージ | `docker.openhands.dev/openhands/runtime:0.61-nikolaik` |
| `MAX_ITERATIONS` | エージェントループの最大反復数 | `80` |

### wrangler.jsonc の主要設定

```jsonc
{
  "containers": [
    {
      "class_name": "OpenHandsContainer",
      "image": "./container/Dockerfile",
      "max_instances": 3,
      "instance_type": {
        "vcpu": 2,
        "memory_mib": 4096,
        "disk_mb": 8000
      }
    }
  ]
}
```

`max_instances` は同時実行できるコンテナ数の上限です。タスク量に応じて調整してください。

---

## コスト目安

中規模タスク（1〜数ファイルの実装）を月20〜30件処理する場合の概算です。

| 費目 | 月額目安 |
|---|---|
| Cloudflare Workers Paid Plan | $5（固定） |
| Cloudflare Containers（CPU/メモリ） | 無料枠内〜数百円 |
| Kimi K2.7 Code API | $2〜6 |
| **合計** | **約 $7〜11** |

実際のコストはタスクの複雑さ（トークン消費量・実行時間）により変動します。初回運用時は `wrangler tail` や Cloudflare ダッシュボードで実測値を確認することを推奨します。

---

## 既知の制約

- **Docker-in-Docker はベータ機能**: Cloudflare Containers の DinD サポートは2026年2月に追加された比較的新しい機能です。rootless モードのみ対応、`iptables` 操作不可という制約があります。
- **自動承認モード**: OpenHands の headless モードは常に自動承認（always-approve）で動作します。**必ず Pull Request 経由でのレビューを徹底し、main ブランチへの直接 push は許可しないでください。**
- **コールドスタート**: OpenHands のサンドボックスランタイムイメージは初回起動時にpullが発生するため、数十秒〜1分程度のコールドスタートが発生します。
- **長時間タスク非対応**: マルチファイルにまたがる大規模リファクタや、1時間を超えるような長時間セッションは本システムのスコープ外です。

## トラブルシューティング

| 症状 | 確認事項 |
|---|---|
| Webhookが届かない | GitHub側の `Recent Deliveries` でレスポンスコードを確認。401の場合は `WEBHOOK_SECRET` の不一致を疑う |
| コンテナが起動しない | `npx wrangler tail` でWorkerのログを確認。Durable Objectのバインディング設定を確認 |
| dockerdが起動しない | entrypoint.sh のログを確認。`--iptables=false --ip6tables=false` が指定されているか確認 |
| OpenHandsがPRを作成しない | GitHub Tokenの権限（`contents:write`, `pull_requests:write`）を確認 |
| Kimi APIエラー | APIキーの有効性、`LLM_BASE_URL` のタイポを確認 |

---

## ライセンス・関連プロジェクト

- [OpenHands](https://github.com/OpenHands/OpenHands) — MIT License
- [Kimi K2.7 Code](https://huggingface.co/moonshotai/Kimi-K2.7-Code) — Modified MIT License（100M MAU または $20M月商を超えるまで実質無制限）
- 本プロジェクト自体のライセンスは用途に応じて設定してください
