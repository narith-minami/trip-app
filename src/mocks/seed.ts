/**
 * src/mocks/seed.ts
 *
 * Static mock seed data for development.
 * All data shapes conform to src/types/entities.ts and server response shapes.
 */

import type { UserSummary, Trip, ScheduleItem, Todo, TripMemo, TripMember } from "@/types/entities";

const now = Date.now();

export const MOCK_USER: UserSummary = {
  id: "user-1",
  name: "Dev User",
  email: "dev@example.com",
  image: null,
};

export const MOCK_SESSION = {
  id: "session-1",
  userId: "user-1",
  expiresAt: new Date(now + 24 * 60 * 60 * 1000),
  createdAt: new Date(now),
  updatedAt: new Date(now),
};

export interface TripWithOwnerAndMembers extends Trip {
  owner: UserSummary;
  members: (TripMember & { user: UserSummary })[];
}

export const MOCK_TRIPS: TripWithOwnerAndMembers[] = [
  {
    id: "trip-1",
    title: "東京旅行",
    destination: "東京",
    startDate: "2025-07-01",
    endDate: "2025-07-05",
    ownerId: "user-1",
    inviteToken: "mock-invite-token-1",
    coverImageUrl: null,
    createdAt: now - 7 * 24 * 60 * 60 * 1000,
    updatedAt: now - 7 * 24 * 60 * 60 * 1000,
    owner: MOCK_USER,
    members: [
      {
        tripId: "trip-1",
        userId: "user-1",
        role: "owner",
        joinedAt: now - 7 * 24 * 60 * 60 * 1000,
        user: MOCK_USER,
      },
    ],
  },
];

export const MOCK_SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: "schedule-1",
    tripId: "trip-1",
    date: "2025-07-01",
    startTime: "09:00",
    title: "羽田空港到着",
    placeName: "羽田空港",
    placeUrl: "https://www.haneda-airport.jp",
    memo: "ANA NH101 で到着予定",
    imageUrl: null,
    orderIndex: 0,
    updatedBy: null,
    createdAt: now - 5 * 24 * 60 * 60 * 1000,
    updatedAt: now - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "schedule-2",
    tripId: "trip-1",
    date: "2025-07-01",
    startTime: "12:00",
    title: "渋谷で昼食",
    placeName: "渋谷スクランブル交差点周辺",
    placeUrl: null,
    memo: "おしゃれなカフェを探す",
    imageUrl: null,
    orderIndex: 1,
    updatedBy: null,
    createdAt: now - 5 * 24 * 60 * 60 * 1000,
    updatedAt: now - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "schedule-3",
    tripId: "trip-1",
    date: "2025-07-02",
    startTime: "10:00",
    title: "浅草寺参拝",
    placeName: "浅草寺",
    placeUrl: "https://www.senso-ji.jp",
    memo: "早めに着いて写真を撮る",
    imageUrl: null,
    orderIndex: 0,
    updatedBy: null,
    createdAt: now - 5 * 24 * 60 * 60 * 1000,
    updatedAt: now - 5 * 24 * 60 * 60 * 1000,
  },
];

export const MOCK_TODOS: Array<Todo & { assignee: UserSummary | null }> = [
  {
    id: "todo-1",
    tripId: "trip-1",
    title: "パスポート確認",
    isDone: 1,
    assigneeId: "user-1",
    assignee: MOCK_USER,
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    updatedAt: now - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "todo-2",
    tripId: "trip-1",
    title: "ホテルの予約確認",
    isDone: 1,
    assigneeId: "user-1",
    assignee: MOCK_USER,
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "todo-3",
    tripId: "trip-1",
    title: "成田エクスプレスのチケット購入",
    isDone: 0,
    assigneeId: "user-1",
    assignee: MOCK_USER,
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
];

export const MOCK_MEMO: TripMemo = {
  tripId: "trip-1",
  content: "# 東京旅行メモ\n\n## 持ち物\n- カメラ\n- 防虫スプレー\n- 日焼け止め\n\n## 予算\n- 宿泊: 300,000円\n- 食事: 150,000円\n- 交通: 100,000円\n\n## 天気予報\n金土: 晴れ、日曜: 曇り、月: 降水確率 40%",
  updatedBy: null,
  updatedAt: now - 2 * 24 * 60 * 60 * 1000,
};

export const MOCK_MEMBERS: Array<TripMember & { user: UserSummary }> = [
  {
    tripId: "trip-1",
    userId: "user-1",
    role: "owner",
    joinedAt: now - 7 * 24 * 60 * 60 * 1000,
    user: MOCK_USER,
  },
];
