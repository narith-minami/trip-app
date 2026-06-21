# 旅程管理アプリ 仕様書 (SPEC_refined)

> 作成日: 2026-06-06  
> 最終更新: 2026-06-06（Supabase 完全除去 → フル Cloudflare 構成に変更）  
> ステータス: MVP設計確定

---

## 1. 背景・目的・解決したい課題

### 背景
家族旅行・友人グループ旅行において、計画〜当日〜振り返りの情報が LINE・メモ・ブックマークに分散し、誰が何を確認しているか把握しにくい。

### 目的
旅行の**計画〜実行〜振り返り**を一つの場所で管理し、グループ全員が同じ情報を見られるようにする。

### 解決したい課題
- 観光地・ホテルの候補リンクや参考写真がバラバラに散在する
- 日程の変更が全員に伝わらない
- 当日のToDoや持ち物チェックが抜け漏れる
- 「誰が何を手配した」が不透明になる

---

## 2. ターゲットユーザー

| ユーザー種別 | 具体像 |
|---|---|
| 家族旅行 | 親＋子ども、帰省・テーマパーク・旅館など |
| 友人グループ旅行 | 2〜6人程度、国内〜海外旅行 |

**利用デバイス**: Web ブラウザのみ（スマホはブラウザで利用）

---

## 3. 機能要件

### 優先度凡例
- 🔴 MVP必須
- 🟡 MVP後に追加
- ⚪ 将来検討

---

### 3-1. 認証・ユーザー管理

| 機能 | 優先度 | 備考 |
|---|---|---|
| Google OAuth ログイン | 🔴 | Better Auth で実装、セッションは D1 に保存 |
| プロフィール（表示名・アイコン） | 🔴 | Google アカウント情報を初期値に |
| ログアウト | 🔴 | |

---

### 3-2. トリップ管理

| 機能 | 優先度 | 備考 |
|---|---|---|
| トリップ作成（タイトル・行先・期間） | 🔴 | |
| トリップ一覧表示（カード形式） | 🔴 | カバー写真・日付・メンバーアイコン表示 |
| トリップ編集・削除 | 🔴 | オーナーのみ削除可 |
| トリップのカバー写真設定 | 🔴 | Cloudflare R2 に保存 |

---

### 3-3. 招待・メンバー管理

| 機能 | 優先度 | 備考 |
|---|---|---|
| 招待リンク生成（トリップ固有URL） | 🔴 | URLに nanoid トークン埋め込み、有効期限なし（MVP） |
| リンクアクセス → ログイン → 自動参加 | 🔴 | 未ログインの場合はGoogleログイン画面へリダイレクト |
| メンバー一覧表示（アバター） | 🔴 | |
| メンバー除外（オーナーのみ） | 🟡 | |
| 招待リンクの無効化・再生成 | 🟡 | |
| 権限ロール（オーナー / 編集者） | 🟡 | MVP では全員が編集可能 |

---

### 3-4. 日程・スケジュール管理

| 機能 | 優先度 | 備考 |
|---|---|---|
| 日付ごとのデイビュー表示 | 🔴 | タブ or 縦スクロールで日付切り替え |
| スケジュールアイテム追加（タイトル・開始時刻・場所・メモ） | 🔴 | |
| タイムライン表示（時刻順に縦並び） | 🔴 | 09:00 チェックイン ✈ のような形式 |
| スケジュールアイテム編集・削除 | 🔴 | |
| アイテムへの写真添付 | 🔴 | 参考画像・当日写真どちらも可、R2 に保存 |
| アイテムへのURL添付（地図・予約確認など） | 🔴 | |
| ドラッグ＆ドロップで並び替え | 🟡 | MVP では時刻入力で自動ソート |
| Google Maps 埋め込みプレビュー | 🟡 | |

---

### 3-5. Todo管理

| 機能 | 優先度 | 備考 |
|---|---|---|
| トリップ単位のTodoリスト | 🔴 | 持ち物・手配タスクなど |
| Todo追加・編集・削除 | 🔴 | |
| Todo完了チェック | 🔴 | |
| Todo担当者アサイン | 🟡 | メンバーへのアサイン |

---

### 3-6. メモ・写真管理

| 機能 | 優先度 | 備考 |
|---|---|---|
| トリップ全体のフリーメモ | 🔴 | プレーンテキスト |
| 写真アップロード（Cloudflare R2） | 🔴 | スケジュールアイテムに紐付け |
| 写真の一覧（トリップ単位のギャラリー表示） | 🟡 | |
| 写真へのキャプション追加 | 🟡 | |

---

### 3-7. 同期

| 機能 | 優先度 | 備考 |
|---|---|---|
| 保存後に画面を最新状態に更新 | 🔴 | TanStack Query の `invalidateQueries` で再フェッチ |
| 最終更新者・更新日時の表示 | 🔴 | アイテムごとに `updated_by` / `updated_at` |
| リアルタイム同期 | ⚪ | MVP対象外。必要なら将来 Cloudflare Durable Objects で対応 |

---

## 4. 非機能要件

### パフォーマンス
- トリップ一覧・デイビューは初期表示 **2秒以内**（Cloudflare CDN キャッシュ活用）
- 写真アップロード上限: **1ファイル 10MB**、トリップ全体 **500MB**（MVP暫定）

### セキュリティ
- 全 API エンドポイントで Better Auth セッション検証を必須化
- トリップへのアクセスは `trip_members` テーブルによるメンバー確認で制限
- 招待トークンは `nanoid` (21文字) で推測困難に

### スケーラビリティ
- MVP: 1トリップあたり最大 **10名**、**30日間**の旅程を想定
- Cloudflare Workers / D1 の無料枠で運用開始

### アクセシビリティ
- モバイルブラウザ（375px〜）でのレスポンシブ対応必須

---

## 5. 技術スタック

| レイヤー | 採用技術 | 理由 |
|---|---|---|
| フロントエンド | **TanStack Start** + TypeScript | SSR対応フルスタックフレームワーク、TanStack Router と統合 |
| ルーティング | **TanStack Router** | 型安全なファイルベースルーティング |
| データ取得・キャッシュ | **TanStack Query** (Server Functions) | 楽観的更新・`invalidateQueries` による再フェッチ |
| UIコンポーネント | **shadcn/ui** + Tailwind CSS | 高品質コンポーネント、カスタマイズ容易 |
| 認証 | **Better Auth** (Google OAuth) | Cloudflare Workers 対応、セッション・ユーザーを D1 に直接保存、外部サービス不要 |
| ORM | **Drizzle ORM** | 型安全なスキーマ定義・マイグレーション、D1 ネイティブ対応 |
| DB | **Cloudflare D1** (SQLite) | エッジ近傍で低レイテンシ、Better Auth / Drizzle と統合 |
| ファイルストレージ | **Cloudflare R2** | 写真保存、S3互換、無料枠 10GB/月 |
| リアルタイム同期 | **なし**（MVP） | `invalidateQueries` による手動再フェッチで十分 |
| デプロイ | **Cloudflare Pages / Workers** | TanStack Start の Cloudflare adapter |
| パッケージマネージャー | **pnpm** | lbose 標準 |

### 外部サービス依存まとめ

| サービス | 用途 |
|---|---|
| Cloudflare | Workers / Pages / D1 / R2（全インフラ統一） |
| Google OAuth | ログイン認証のみ（Better Auth 経由） |

**Supabase は完全に不使用。**

---

## 6. データモデル（Drizzle スキーマ）

Drizzle ORM + Cloudflare D1 (SQLite) で定義する。  
Better Auth が `users` / `sessions` / `accounts` テーブルを自動生成するため、アプリ側は拡張分のみ定義する。

```ts
// schema.ts
import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'

// --- Better Auth が自動生成するテーブル（参照用） ---
// users    : id, name, email, emailVerified, image, createdAt, updatedAt
// sessions : id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId
// accounts : id, accountId, providerId, userId, accessToken, ...

// --- アプリ固有テーブル ---

export const trips = sqliteTable('trips', {
  id:            text('id').primaryKey(),        // nanoid
  title:         text('title').notNull(),
  destination:   text('destination'),
  startDate:     text('start_date').notNull(),   // "YYYY-MM-DD"
  endDate:       text('end_date').notNull(),
  coverImageUrl: text('cover_image_url'),
  ownerId:       text('owner_id').notNull(),     // FK: users.id
  inviteToken:   text('invite_token').notNull().unique(), // nanoid
  createdAt:     integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const tripMembers = sqliteTable('trip_members', {
  tripId:   text('trip_id').notNull(),           // FK: trips.id
  userId:   text('user_id').notNull(),           // FK: users.id
  role:     text('role', { enum: ['owner', 'member'] }).notNull().default('member'),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.tripId, t.userId] }) }))

export const scheduleItems = sqliteTable('schedule_items', {
  id:         text('id').primaryKey(),
  tripId:     text('trip_id').notNull(),
  date:       text('date').notNull(),            // "YYYY-MM-DD"
  startTime:  text('start_time'),                // "HH:MM" nullable
  title:      text('title').notNull(),
  placeName:  text('place_name'),
  placeUrl:   text('place_url'),
  memo:       text('memo'),
  imageUrl:   text('image_url'),                 // R2 オブジェクトキー
  orderIndex: integer('order_index').notNull().default(0),
  updatedBy:  text('updated_by'),                // FK: users.id
  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  tripDateIdx: index('idx_schedule_trip_date').on(t.tripId, t.date),
}))

export const todos = sqliteTable('todos', {
  id:         text('id').primaryKey(),
  tripId:     text('trip_id').notNull(),
  title:      text('title').notNull(),
  isDone:     integer('is_done', { mode: 'boolean' }).notNull().default(false),
  assigneeId: text('assignee_id'),               // FK: users.id, nullable
  createdAt:  integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const tripMemos = sqliteTable('trip_memos', {
  tripId:    text('trip_id').primaryKey(),       // 1トリップ1メモ
  content:   text('content').notNull().default(''),
  updatedBy: text('updated_by'),                 // FK: users.id
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
```

### D1 固有の注意事項
- UUID の代わりに `nanoid` を使用（D1 は `gen_random_uuid()` 未サポート）
- `date` / `time` 型は SQLite にないため `text` で保持、アプリ層で `dayjs` を使ってパース
- `boolean` は `integer` (0/1) にマップ（Drizzle が自動変換）
- マイグレーション: `drizzle-kit generate` → `wrangler d1 migrations apply` を CI/CD に組み込む

---

## 7. 画面構成（MVP）

```
/ (ランディング)
  → 未ログイン: Google ログインボタン
  → ログイン済み: /trips へリダイレクト

/trips
  トリップ一覧（カード）
  + 新規トリップ作成ボタン

/trips/[id]
  トリップ詳細
  ├── ヘッダー（カバー写真・タイトル・期間・メンバーアバター）
  ├── タブ: [日程] [Todo] [メモ]
  │
  ├── [日程タブ]
  │   日付セレクター → タイムライン表示
  │   スケジュールアイテム追加/編集
  │
  ├── [Todoタブ]
  │   チェックリスト
  │
  └── [メモタブ]
      フリーテキストエリア

/trips/[id]/settings
  タイトル・期間編集
  メンバー一覧
  招待リンクコピー
  トリップ削除（オーナーのみ）

/invite/[token]
  招待受け入れ → ログイン → トリップ参加 → /trips/[id] へリダイレクト
```

---

## 8. UI/UXの方針

- **わくわく感の演出**
  - トリップカードにカバー写真 + グラデーションオーバーレイ
  - スケジュールアイテムはアイコン付きタイムライン（✈ 🏨 🍜 など絵文字対応）
  - 新規作成時のアニメーション（スライドイン・フェード）
- **モバイルファースト**: 375px〜対応
- **楽観的UI更新**: 保存完了を待たずにUI反映、エラー時はロールバック＋トースト通知
- **最終更新者の可視化**: 「Narithが5分前に更新」のようなサブテキスト表示

---

## 9. 意思決定の背景とトレードオフ

| 決定事項 | 採用 | 不採用の代替 | 理由 |
|---|---|---|---|
| インフラ統一 | Cloudflare のみ | Supabase + Vercel | 外部サービス依存を最小化、コスト予測が容易 |
| 認証 | Better Auth (Google OAuth) | Supabase Auth / Auth.js | Cloudflare Workers ネイティブ対応、D1 に直接保存して外部依存ゼロ |
| DB | Cloudflare D1 (SQLite) | Supabase PostgreSQL / Turso | Cloudflare エコシステム統一、エッジ低レイテンシ |
| ORM | Drizzle ORM | Prisma / Kysely | D1対応・型安全・軽量。Prismaは Cloudflare Workers 非対応 |
| ストレージ | Cloudflare R2 | Supabase Storage / S3 | Cloudflare エコシステム統一、無料枠 10GB/月 |
| 同期方式 | `invalidateQueries` 再フェッチ | リアルタイム同期 | MVP スコープ外。旅行計画は即時性より正確性が重要 |
| 招待方式 | リンクシェアのみ | メール招待 | LINEでのシェアが主流のユースケースに合致 |
| 費用管理 | MVP除外 | 含める | コア体験に集中。追加は容易 |
| 権限ロール | MVP は全員編集可 | オーナーのみ編集 | 家族・友人間の信頼前提 |

---

## 10. 未解決の懸念事項・将来の検討事項

### 懸念事項
- **D1 の書き込み制限**: Cloudflare D1 Free プランは 100K write rows/day。トリップ数が増えると上限に近づく可能性。必要に応じて Paid プランへ移行
- **Better Auth の Cloudflare Workers 対応**: 比較的新しいライブラリのため、Workers 環境での動作検証を早期に行うこと（特に `crypto` API の利用）
- **写真リサイズ**: R2 は保存のみ。サムネイル生成は Cloudflare Images (有料) または Workers での on-the-fly リサイズが別途必要
- **招待リンクのセキュリティ**: トークン無効化機能がないと意図しない参加のリスク（MVP後に対処）
- **競合編集**: last-write-wins のため、同時編集時にデータが上書きされる可能性。メモ欄は特に注意

### 将来の検討事項
- リアルタイム同期（Cloudflare Durable Objects + WebSocket）
- 費用・予算管理（割り勘計算）
- Google Maps 埋め込み・場所検索
- 招待リンクの有効期限・無効化
- 権限ロール（閲覧専用メンバー）
- オフライン対応（PWA）
- 旅行後のアルバム生成・共有機能
- プッシュ通知（スケジュール変更の通知）
- ネイティブアプリ（React Native / Expo）
