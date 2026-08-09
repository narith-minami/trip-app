# API 一覧

> アプリ: 旅程管理アプリ  
> 作成日: 2026-06-06  
> 実装方式: TanStack Start Server Functions  
> 認証: Better Auth（全エンドポイントでセッション検証必須）  
> 優先度: 🔴 MVP必須 / 🟡 MVP後

---

## 凡例

- **認証**: 🔒 = ログイン必須 / 🔓 = 不要
- **認可**: メンバー = トリップメンバーのみ / オーナー = オーナーのみ

---

## 1. 認証 (Better Auth が自動提供)

| # | メソッド | パス | 説明 | 認証 | 優先度 |
|---|---|---|---|---|---|
| A-1 | GET | `/api/auth/signin/google` | Google OAuth 開始 | 🔓 | 🔴 |
| A-2 | GET | `/api/auth/callback/google` | OAuth コールバック | 🔓 | 🔴 |
| A-3 | POST | `/api/auth/signout` | ログアウト・セッション破棄 | 🔒 | 🔴 |
| A-4 | GET | `/api/auth/session` | 現在のセッション・ユーザー取得 | 🔓 | 🔴 |

> Better Auth が `/api/auth/[...all]` で自動ハンドリング。個別実装不要。

---

## 2. ユーザー

| # | メソッド | パス | 説明 | 認証 | 優先度 |
|---|---|---|---|---|---|
| U-1 | GET | `/api/users/me` | 自分のプロフィール取得 | 🔒 | 🔴 |
| U-2 | PATCH | `/api/users/me` | 表示名・アバター更新 | 🔒 | 🟡 |

**U-1 レスポンス**
```json
{
  "id": "usr_xxx",
  "name": "Narith",
  "email": "narith@example.com",
  "image": "https://..."
}
```

---

## 3. トリップ

| # | メソッド | パス | 説明 | 認証 | 認可 | 優先度 |
|---|---|---|---|---|---|---|
| T-1 | GET | `/api/trips` | 自分が参加するトリップ一覧 | 🔒 | 本人 | 🔴 |
| T-2 | POST | `/api/trips` | トリップ作成 | 🔒 | ログインユーザー | 🔴 |
| T-3 | GET | `/api/trips/:tripId` | トリップ詳細取得 | 🔒 | メンバー | 🔴 |
| T-4 | PATCH | `/api/trips/:tripId` | タイトル・行先・期間の更新 | 🔒 | メンバー | 🔴 |
| T-5 | DELETE | `/api/trips/:tripId` | トリップ削除 | 🔒 | オーナー | 🔴 |

**T-2 リクエスト**
```json
{
  "title": "沖縄旅行2026",
  "destination": "沖縄",
  "startDate": "2026-08-10",
  "endDate": "2026-08-13"
}
```

**T-1 / T-3 レスポンス（抜粋）**
```json
{
  "id": "trip_xxx",
  "title": "沖縄旅行2026",
  "destination": "沖縄",
  "startDate": "2026-08-10",
  "endDate": "2026-08-13",
  "coverImageUrl": "https://r2.example.com/...",
  "ownerId": "usr_xxx",
  "members": [
    { "userId": "usr_xxx", "name": "Narith", "image": "...", "role": "owner" }
  ],
  "updatedAt": "2026-06-06T12:00:00Z"
}
```

---

## 4. カバー写真

| # | メソッド | パス | 説明 | 認証 | 認可 | 優先度 |
|---|---|---|---|---|---|---|
| C-1 | POST | `/api/trips/:tripId/cover` | カバー写真アップロード（R2） | 🔒 | メンバー | 🔴 |
| C-2 | DELETE | `/api/trips/:tripId/cover` | カバー写真削除 | 🔒 | メンバー | 🟡 |

> `multipart/form-data` で受け取り、R2 に保存後 URL を trips テーブルに書き込む。

---

## 5. 招待・メンバー管理

| # | メソッド | パス | 説明 | 認証 | 認可 | 優先度 |
|---|---|---|---|---|---|---|
| I-1 | GET | `/api/trips/:tripId/invite` | 招待トークン取得（招待リンク生成用） | 🔒 | メンバー | 🔴 |
| I-2 | POST | `/api/invite/:token/join` | 招待トークンで参加 | 🔒 | ログインユーザー | 🔴 |
| I-3 | GET | `/api/invite/:token` | トークンからトリップ情報プレビュー取得 | 🔓 | — | 🔴 |
| I-4 | GET | `/api/trips/:tripId/members` | メンバー一覧取得 | 🔒 | メンバー | 🔴 |
| I-5 | DELETE | `/api/trips/:tripId/members/:userId` | メンバー除外 | 🔒 | オーナー | 🟡 |
| I-6 | POST | `/api/trips/:tripId/invite/regenerate` | 招待トークン再生成 | 🔒 | オーナー | 🟡 |

**I-3 レスポンス（ログイン前プレビュー用）**
```json
{
  "tripId": "trip_xxx",
  "title": "沖縄旅行2026",
  "destination": "沖縄",
  "startDate": "2026-08-10",
  "endDate": "2026-08-13",
  "memberCount": 3
}
```

---

## 6. スケジュールアイテム

| # | メソッド | パス | 説明 | 認証 | 認可 | 優先度 |
|---|---|---|---|---|---|---|
| S-1 | GET | `/api/trips/:tripId/schedules` | 全日程のスケジュール一覧取得 | 🔒 | メンバー | 🔴 |
| S-2 | GET | `/api/trips/:tripId/schedules?date=YYYY-MM-DD` | 特定日付のスケジュール取得 | 🔒 | メンバー | 🔴 |
| S-3 | POST | `/api/trips/:tripId/schedules` | スケジュールアイテム作成 | 🔒 | メンバー | 🔴 |
| S-4 | PATCH | `/api/trips/:tripId/schedules/:itemId` | スケジュールアイテム更新 | 🔒 | メンバー | 🔴 |
| S-5 | DELETE | `/api/trips/:tripId/schedules/:itemId` | スケジュールアイテム削除 | 🔒 | メンバー | 🔴 |
| S-6 | POST | `/api/trips/:tripId/schedules/:itemId/image` | アイテムへの写真アップロード（R2） | 🔒 | メンバー | 🔴 |
| S-7 | DELETE | `/api/trips/:tripId/schedules/:itemId/image` | アイテムの写真削除 | 🔒 | メンバー | 🟡 |
| S-8 | PATCH | `/api/trips/:tripId/schedules/reorder` | 並び順一括更新（orderIndex） | 🔒 | メンバー | 🟡 |

**S-3 リクエスト**
```json
{
  "date": "2026-08-10",
  "startTime": "15:00",
  "title": "ホテルチェックイン",
  "placeName": "ザ・ブセナテラス",
  "placeUrl": "https://maps.google.com/...",
  "memo": "駐車場あり"
}
```

**S-1 / S-2 レスポンス**
```json
[
  {
    "id": "item_xxx",
    "date": "2026-08-10",
    "startTime": "15:00",
    "title": "ホテルチェックイン",
    "placeName": "ザ・ブセナテラス",
    "placeUrl": "https://maps.google.com/...",
    "memo": "駐車場あり",
    "imageUrl": "https://r2.example.com/...",
    "orderIndex": 2,
    "updatedBy": { "userId": "usr_xxx", "name": "Narith" },
    "updatedAt": "2026-06-06T12:00:00Z"
  }
]
```

---

## 7. Todo

| # | メソッド | パス | 説明 | 認証 | 認可 | 優先度 |
|---|---|---|---|---|---|---|
| D-1 | GET | `/api/trips/:tripId/todos` | Todo一覧取得 | 🔒 | メンバー | 🔴 |
| D-2 | POST | `/api/trips/:tripId/todos` | Todo作成 | 🔒 | メンバー | 🔴 |
| D-3 | PATCH | `/api/trips/:tripId/todos/:todoId` | Todo更新（タイトル・完了状態） | 🔒 | メンバー | 🔴 |
| D-4 | DELETE | `/api/trips/:tripId/todos/:todoId` | Todo削除 | 🔒 | メンバー | 🔴 |

**D-3 リクエスト**
```json
{
  "isDone": true
}
```

---

## 8. メモ（付箋）

1トリップに複数のメモ（付箋）を持てる。作成・編集はトリップメンバー全員、削除は作成者本人のみ。

| # | メソッド | パス | 説明 | 認証 | 認可 | 優先度 |
|---|---|---|---|---|---|---|
| M-1 | GET | `/api/trips/:tripId/memo` | メモ一覧取得（最終更新日時の降順） | 🔒 | メンバー | 🔴 |
| M-2 | POST | `/api/trips/:tripId/memo` | メモ作成 | 🔒 | メンバー | 🔴 |
| M-3 | PUT | `/api/trips/:tripId/memo/:memoId` | メモ更新 | 🔒 | メンバー | 🔴 |
| M-4 | DELETE | `/api/trips/:tripId/memo/:memoId` | メモ削除 | 🔒 | 作成者のみ | 🔴 |

**M-2 / M-3 リクエスト**
```json
{
  "content": "## 持ち物\n- パスポート\n- 日焼け止め"
}
```

---

## 9. エラーレスポンス共通仕様

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "このトリップへのアクセス権がありません"
  }
}
```

| HTTPステータス | code | 説明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | リクエストパラメータ不正 |
| 401 | `UNAUTHORIZED` | 未認証 |
| 403 | `FORBIDDEN` | 権限なし（メンバー外・オーナー外） |
| 404 | `NOT_FOUND` | リソースが存在しない |
| 409 | `CONFLICT` | 既に参加済み（招待join時など） |
| 500 | `INTERNAL_ERROR` | サーバーエラー |

---

## 10. API サマリー

| カテゴリ | 🔴 MVP | 🟡 MVP後 | 合計 |
|---|---|---|---|
| 認証（Better Auth） | 4 | 0 | 4 |
| ユーザー | 1 | 1 | 2 |
| トリップ | 5 | 0 | 5 |
| カバー写真 | 1 | 1 | 2 |
| 招待・メンバー | 4 | 2 | 6 |
| スケジュール | 6 | 2 | 8 |
| Todo | 4 | 0 | 4 |
| メモ | 2 | 0 | 2 |
| **合計** | **27** | **6** | **33** |
