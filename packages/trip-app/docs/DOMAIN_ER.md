# ドメイン概念図 & ER図

> アプリ: 旅程管理アプリ  
> 作成日: 2026-06-06

---

## 1. ドメイン概念図

```mermaid
graph TB
  subgraph 認証ドメイン["🔐 認証ドメイン"]
    User["👤 ユーザー\n(User)\n─────────────\n・名前\n・メールアドレス\n・アバター画像\n・Googleアカウント連携"]
    Session["🎫 セッション\n(Session)\n─────────────\n・トークン\n・有効期限\n(Better Auth管理)"]
  end

  subgraph 旅程ドメイン["✈️ 旅程ドメイン"]
    Trip["🗺️ トリップ\n(Trip)\n─────────────\n・タイトル\n・行先\n・出発日〜帰着日\n・カバー写真\n・招待トークン"]
    TripMember["👥 トリップメンバー\n(TripMember)\n─────────────\n・ロール\n  (オーナー/メンバー)\n・参加日時"]
  end

  subgraph 計画ドメイン["📅 計画ドメイン"]
    ScheduleItem["🕐 スケジュールアイテム\n(ScheduleItem)\n─────────────\n・日付\n・開始時刻\n・タイトル\n・場所名・場所URL\n・メモ\n・写真\n・表示順"]
    Todo["✅ Todo\n(Todo)\n─────────────\n・タイトル\n・完了フラグ\n・担当者"]
    TripMemo["📝 トリップメモ\n(TripMemo)\n─────────────\n・本文（プレーンテキスト）\n・最終更新者"]
  end

  subgraph ストレージドメイン["☁️ ストレージ (Cloudflare R2)"]
    R2["🖼️ ファイルストレージ\n─────────────\n・カバー写真\n・スケジュール写真"]
  end

  %% 関係
  User -->|"セッションを持つ"| Session
  User -->|"トリップを作成する\n(オーナーになる)"| Trip
  User -->|"トリップに参加する"| TripMember
  TripMember -->|"所属する"| Trip

  Trip -->|"日程を持つ (0..n)"| ScheduleItem
  Trip -->|"Todoを持つ (0..n)"| Todo
  Trip -->|"メモを持つ (0..n)"| TripMemo
  Trip -->|"カバー写真を持つ"| R2

  ScheduleItem -->|"写真を持つ (0..1)"| R2
  Todo -->|"担当者を持つ (0..1)"| User
  TripMember -->|"参照する"| User

  style 認証ドメイン fill:#EEF2FF,stroke:#6366F1
  style 旅程ドメイン fill:#FFF7ED,stroke:#F97316
  style 計画ドメイン fill:#F0FDF4,stroke:#22C55E
  style ストレージドメイン fill:#F0F9FF,stroke:#0EA5E9
```

---

## 2. ER図

```mermaid
erDiagram

  %% ── Better Auth 管理テーブル ──────────────────────
  users {
    text    id           PK  "nanoid (Better Auth生成)"
    text    name             "表示名"
    text    email            "メールアドレス (unique)"
    int     emailVerified    "メール確認フラグ"
    text    image            "アバターURL"
    int     createdAt        "timestamp"
    int     updatedAt        "timestamp"
  }

  sessions {
    text    id           PK
    text    userId       FK
    text    token            "セッショントークン (unique)"
    int     expiresAt        "timestamp"
    text    ipAddress
    text    userAgent
    int     createdAt
    int     updatedAt
  }

  accounts {
    text    id           PK
    text    userId       FK
    text    providerId       "'google'"
    text    accountId        "Google sub"
    text    accessToken
    text    refreshToken
    int     createdAt
    int     updatedAt
  }

  %% ── アプリ固有テーブル ──────────────────────────
  trips {
    text    id           PK  "nanoid"
    text    title            "トリップ名"
    text    destination      "行先 (nullable)"
    text    startDate        "YYYY-MM-DD"
    text    endDate          "YYYY-MM-DD"
    text    coverImageUrl    "R2オブジェクトキー (nullable)"
    text    ownerId      FK  "users.id"
    text    inviteToken      "nanoid (unique)"
    int     createdAt        "timestamp"
    int     updatedAt        "timestamp"
  }

  trip_members {
    text    tripId       FK  "trips.id"
    text    userId       FK  "users.id"
    text    role             "'owner' | 'member'"
    int     joinedAt         "timestamp"
  }

  schedule_items {
    text    id           PK  "nanoid"
    text    tripId       FK  "trips.id"
    text    date             "YYYY-MM-DD"
    text    startTime        "HH:MM (nullable)"
    text    title
    text    placeName        "nullable"
    text    placeUrl         "nullable"
    text    memo             "nullable"
    text    imageUrl         "R2オブジェクトキー (nullable)"
    int     orderIndex       "表示順"
    text    updatedBy    FK  "users.id (nullable)"
    int     createdAt        "timestamp"
    int     updatedAt        "timestamp"
  }

  todos {
    text    id           PK  "nanoid"
    text    tripId       FK  "trips.id"
    text    title
    int     isDone           "0 | 1"
    text    assigneeId   FK  "users.id (nullable)"
    int     createdAt        "timestamp"
    int     updatedAt        "timestamp"
  }

  trip_memos {
    text    id           PK  "nanoid"
    text    tripId       FK  "trips.id"
    text    content          "プレーンテキスト"
    text    createdBy    FK  "users.id"
    text    updatedBy    FK  "users.id (nullable)"
    int     createdAt        "timestamp"
    int     updatedAt        "timestamp"
  }

  %% ── リレーション ──────────────────────────────
  users       ||--o{ sessions       : "持つ"
  users       ||--o{ accounts       : "持つ"
  users       ||--o{ trips          : "作成する (owner)"
  users       ||--o{ trip_members   : "参加する"
  users       ||--o{ todos          : "担当する (assignee)"
  users       ||--o{ schedule_items : "最終更新する"
  users       ||--o{ trip_memos     : "作成する"
  users       ||--o{ trip_memos     : "最終更新する"

  trips       ||--o{ trip_members   : "持つ"
  trips       ||--o{ schedule_items : "持つ"
  trips       ||--o{ todos          : "持つ"
  trips       ||--o{ trip_memos     : "持つ"
```

---

## 3. 主要な設計判断の補足

### 複合主キー (trip_members)
`trip_members` は `(tripId, userId)` の複合主キー。同一ユーザーが同一トリップに重複参加できない制約をDBレベルで保証する。

### trip_memos（付箋メモ）
1トリップに複数のメモ（付箋）を持てるよう `id` を PK にし、`tripId` は通常の FK として持つ。
`createdBy`（作成者、not null）と `updatedBy`（最終更新者、nullable）の両方を持ち、
編集はトリップメンバー全員に許可、削除は `createdBy` 本人のみに制限するアプリ側の権限判定に使う。

### inviteToken の分離
招待トークンは `trips` テーブルに持たせる。トリップIDとは独立した nanoid にすることで、トークンを再生成してもトリップIDは不変に保てる。

### updatedBy の nullable
スケジュールアイテム・メモの `updatedBy` は nullable。システム側から初期生成した場合やオーナーが自身で作成した直後など、更新者情報が不要なケースに対応する。

### Better Auth テーブルの ownership
`users` / `sessions` / `accounts` は Better Auth が DDL を自動生成・管理する。Drizzle スキーマには参照用として記述するが、マイグレーション対象外とする（`drizzle-kit` の `tablesFilter` で除外）。
```
