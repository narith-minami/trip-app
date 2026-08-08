# 未実装機能・残タスク一覧

> 調査日: 2026-08-08（前回調査 2026-06-27 からの更新版）
>
> 前回調査時点の🔴🟡項目（認証ミドルウェア・招待ページ・招待受け入れAPI・`database_id`設定）は
> その後のPRで解消済みのため、実コードを再調査して全面的に洗い出し直した。
> 今回はアカウント周辺機能（ログアウト・パスワード再設定・利用規約等）の欠落を中心に追加。

---

## 🔴 緊急（リリースブロッカー）

### 1. CI が実質動いていない

- **場所**: `.github/workflows/ci.yml`
- **内容**: トリガーが `branches: [main__, develop__]`（末尾に `__` が付いた存在しないブランチ名）になっている。リポジトリの実際のデフォルトブランチは `main`
- **影響**: PR・push で CI が一度も実行されない。typecheck/lint/test/buildの品質ゲートが機能していない

### 2. R2 バケットが無効化されたまま

- **場所**: `wrangler.toml`（`[[r2_buckets]]` がコメントアウト）
- **内容**: `fix(deploy): disable R2 binding until R2 is enabled on the account` の対応のまま放置。カバー画像アップロード（`src/server/routes/cover.ts`）・スケジュール項目の複数画像添付（`src/server/routes/scheduleImages.ts`、UIは既にリリース済み機能）は `c.env.R2` に依存しており、バインディングが無いと `503` を返す
- **影響**: 画像添付機能（既にUIとして公開済み）が本番で全く動作しない

### 3. 本番シークレットの設定未確認

- **場所**: Cloudflare Dashboard / `wrangler secret put`
- **内容**: `AUTH_SECRET` / `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `RESEND_API_KEY` を本番環境に設定済みか未確認。未設定だと Google OAuth ログインが機能しない（email/passwordのみ有効化される）。`RESEND_API_KEY` が無いとパスワード再設定メールが送信できず 500 になる。また `wrangler.toml` の `EMAIL_FROM` はプレースホルダー（`noreply@example.com`）のままなので、Resend でドメイン認証した実アドレスに差し替える必要がある

### 4. デプロイ・マイグレーション導線が未整備

- **場所**: `package.json`（`deploy` スクリプトが存在しない）
- **内容**: `wrangler deploy` や `wrangler d1 migrations apply trip-app-db --remote` の手順がスクリプト化・CI/CD化されていない。手動デプロイ時の手順書も無い

### 5. ログアウト機能が存在しない

- **場所**: `src/lib/auth-client.ts`、UI全体
- **内容**: `signOut` は `src/mocks/auth-client.ts`（モック用）にしか実装されておらず、本番用 `src/lib/auth-client.ts` は `useSession` / `signIn` / `signUp` のみエクスポート。さらに `__root.tsx` にはグローバルヘッダー/ナビゲーションが存在せず、ログアウトボタンがどの画面にも無い
- **影響**: ログインしたユーザーが正規の方法でログアウトできない

### 6. 利用規約・プライバシーポリシーが無い

- **場所**: `src/routes/`（該当ページ無し）、`signup.tsx`（同意チェックボックス無し）
- **内容**: 利用規約・プライバシーポリシーのページが存在せず、新規登録フォームにも同意チェックボックスが無い
- **影響**: 実ユーザーに公開する前提のサービスとして法的に必須。個人情報（メールアドレス・Googleアカウント情報・旅行データ）を扱う以上、最低限プライバシーポリシーは必要

---

## 🟡 高優先度（アカウント周辺機能）

### 9. メールアドレス確認（email verification）

- **場所**: `src/server/routes/auth.ts`（`emailVerification` 未設定）
- **内容**: `emailAndPassword` 登録時にメール確認を要求していない。`users.emailVerified` フィールドはAPIレスポンスに含まれているが常に `false` のまま使われていない
- **メモ**: メール送信基盤（`src/server/lib/email.ts`、Resend連携）は実装済みのため、`sendVerificationEmail` コールバックと確認用テンプレートを追加すれば良い

### 10. アカウント設定・プロフィール編集ページ

- **場所**: `src/routes/`（該当ページ無し）
- **内容**: 表示名・アイコンの変更、メールアドレス変更、パスワード変更を行う画面が無い。`GET /api/users/me` はあるが更新系エンドポイントも無い

### 11. アカウント削除

- **場所**: 未実装
- **内容**: ユーザーが自分のアカウントを削除する手段が無い（API・UIとも無し）。個人情報を扱うサービスとして退会導線は望ましい

### 12. カバー画像アップロードのクライアント実装

- **場所**: `src/api/cover.ts`（未作成）、`src/features/trips/` にアップロードUI無し
- **内容**: サーバー側 `cover.ts` は実装済みだが、対応するAPIクライアント・アップロードUIが無く機能として使えない
- **対応方針**: 今回のリリース対象に含めるか、対象外として明示（デッドコードとして残すなら理由をコメントに残す）を決める

---

## 🟢 中優先度（品質・運用）

### 13. E2E テスト未作成

- **場所**: `src/**/*.e2e.ts`
- **内容**: `pnpm test:e2e` は定義済みだが対応する Playwright テストが無い。最低限ログイン→旅行作成→招待→スケジュール追加のハッピーパスは自動化したい

### 14. エラーロギング・監視が無い

- **場所**: `src/server/app.ts`（`app.onError` がエラーを握りつぶすのみ）
- **内容**: Sentry等の外形監視・エラー収集の仕組みが無く、本番障害に気づけない

### 15. API のレート制限が無い

- **場所**: `src/server/app.ts` 全体、特に `/api/invite/:token/join`・`/api/auth/*`
- **内容**: 総当たり・乱用を防ぐレート制限が無い。Cloudflare の Rate Limiting ルール等で保護したい

### 16. `index.html` にメタ情報が無い

- **場所**: `index.html`
- **内容**: favicon・OGP・description等が皆無（`<title>Trip App</title>` のみ）

### 21. `src/types/entities.ts` の手書き型をHono RPCの型推論から導出したい（アーキテクチャ判断が必要）

- **場所**: `src/types/entities.ts`、`src/routes/trips/index.tsx:59`、`src/routes/trips/$tripId/index.tsx:65`
- **内容**: `entities.ts` の12個の型（`Trip`/`TripMember`/`Todo`等）は手書きで、サーバーのDrizzleスキーマ・Honoルートの実レスポンス形と同期を保つ責務が人手に依存している。実際すでにズレがあり、次の2箇所で `as` キャストによる回避が必要になっている:
  - `routes/trips/index.tsx:59`: `(tripsData?.data ?? []) as TripCardData[]`
  - `routes/trips/$tripId/index.tsx:65`: `trip.members as TripMember[] | undefined`

  理想は `hc<AppType>` クライアント（`src/api/client.ts`）の `InferResponseType` から型を導出し、`entities.ts` をその再エクスポート窓口にすること（クリーンコードレビュー計画のPhase 10として着手を検討）。

- **調査結果（今回、実装はせず調査のみ実施）**: `.dependency-cruiser.cjs` の `types-have-no-deps` ルール（severity: error）が `src/types/` から `src/api/`（および `features/components/routes/hooks/lib/server`）への依存を明示的に禁止しており、`entities.ts` が `src/api/client.ts`（延いては `src/server/app.ts` の `AppType`）に依存する形にすると即座にlintエラーになることを確認した。これは元のリファクタ計画自身が定めていた中止条件（「depcruiseが types→api/client の import を拒否した場合はこのフェーズを中止」）に該当する。
- **対応方針の選択肢**（要アーキテクチャ判断のため未着手）:
  1. `entities.ts` を対象外に `types-have-no-deps` へ例外を追加する（境界ルールの意図的な緩和）
  2. RPC由来の型定義を `src/api/` 側の新規ファイル（例: `src/api/entities.ts`）に置き、`src/types/entities.ts` は廃止して全消費側のimportを切り替える（`types` を唯一の窓口に保つという元計画の前提を変更することになり、影響範囲が広い）
  3. 現状維持し、ズレが生じた箇所だけ都度 `as` キャストで対応する（現状の運用）
- **影響**: 実害は上記2箇所の型キャストのみで、機能的なバグではない。ただし今後サーバー側レスポンス形が変わった際にも `entities.ts` 側の手動更新漏れで同様の型ズレ・キャストが増える可能性がある

---

## ⚪ 確認・設定事項

| # | 項目 | 場所 | 内容 |
|---|------|------|------|
| 17 | `BETTER_AUTH_URL` が本番ドメインと一致しているか | `wrangler.toml` | デプロイ先の実URLと相違が無いか確認 |
| 18 | Google OAuth の本番リダイレクトURI登録 | Google Cloud Console | 本番ドメインでのリダイレクトURIが登録済みか確認 |
| 19 | `VITE_MOCK` の本番ビルドでの扱い | `vite.config.ts` | `env.VITE_MOCK !== "false"` がモック有効条件のため、未設定だとデフォルトでモックになる点に注意。本番ビルドで確実に `false` になっているか確認 |
| 20 | D1 本番マイグレーション適用 | Cloudflare D1 | `--local` フラグは開発用のみ。本番DBへの `--remote` 適用手順を確認・実行 |

---

## ✅ 解消済み（前回調査 2026-06-27 時点の項目）

- 認証ミドルウェア（`requireSession`）実装済み
- 招待ページ（`/invite/$token`）・招待受け入れAPI（`POST /api/invite/:token/join`）実装済み
- `wrangler.toml` の `database_id` 設定済み
- コード品質（biome v2移行・lint負債解消）対応済み

## ✅ 解消済み（今回の調査時点の項目）

- メール送信基盤（旧#7）: Resend 連携ラッパー `src/server/lib/email.ts` を追加。`RESEND_API_KEY` /
  `EMAIL_FROM` を環境変数化（本番値は未設定、上記#3参照）
- パスワード再設定フロー（旧#8）: `emailAndPassword.sendResetPassword` を配線し、
  `/forgot-password`・`/reset-password` ページを追加。ログイン画面に「パスワードを忘れた方」導線を追加

---

## 実装順序の推奨

```
1. CI ブランチ名修正 (#1)              ← 品質ゲートの土台。真っ先に直す
2. R2 有効化・本番シークレット確認 (#2, #3) ← 既存機能（画像添付）を動かすために必須
3. デプロイ導線整備 (#4)
4. ログアウト実装 (#5)                 ← 最小限のアカウント管理として必須
5. 利用規約・プライバシーポリシー (#6)   ← 公開前に法的に必須
6. メール確認 (#9)                     ← メール送信基盤は実装済み、コールバック追加のみ
7. アカウント設定・削除 (#10, #11)
8. カバー画像クライアント実装 or 対象外判断 (#12)
9. E2Eテスト・監視・レート制限・メタ情報 (#13-16)
10. 確認事項の整理 (#17-20)
```
