/**
 * src/mocks/api/memo.ts
 *
 * Mock memo (sticky note) API. CRUD over an in-memory list of per-trip memos.
 * Mirrors the exported functions of src/api/memo.ts (AGENTS.md #24).
 */

import type { TripMemo, UserSummary } from "@/types/entities";

const mockUser: UserSummary = {
  id: "user-1",
  name: "Dev User",
  email: "dev@example.com",
  image: null,
};

const otherUser: UserSummary = {
  id: "user-2",
  name: "Hanako",
  email: "hanako@example.com",
  image: null,
};

const now = Date.now();

const seed: TripMemo[] = [
  {
    id: "memo-1",
    tripId: "trip-1",
    content: "持ち物\n- カメラ\n- 防虫スプレー",
    createdBy: mockUser.id,
    creator: mockUser,
    updatedBy: mockUser.id,
    updater: mockUser,
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "memo-2",
    tripId: "trip-1",
    content: "レンタカーは3日目の朝に返却。ガソリン満タンにしておく。",
    createdBy: otherUser.id,
    creator: otherUser,
    updatedBy: mockUser.id,
    updater: mockUser,
    createdAt: now - 1 * 24 * 60 * 60 * 1000,
    updatedAt: now - 3 * 60 * 60 * 1000,
  },
];

const memos = structuredClone(seed);

function sortDesc(list: TripMemo[]) {
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function fetchMemos(tripId: string) {
  return sortDesc(memos.filter((m) => m.tripId === tripId));
}

export async function createMemo(tripId: string, content: string) {
  const ts = Date.now();
  const newMemo: TripMemo = {
    id: `memo-${ts}`,
    tripId,
    content,
    createdBy: mockUser.id,
    creator: mockUser,
    updatedBy: mockUser.id,
    updater: mockUser,
    createdAt: ts,
    updatedAt: ts,
  };
  memos.push(newMemo);
  return newMemo;
}

export async function updateMemo(tripId: string, memoId: string, content: string) {
  const memo = memos.find((m) => m.id === memoId && m.tripId === tripId);
  if (!memo) throw new Error(`Memo ${memoId} not found`);

  memo.content = content;
  memo.updatedBy = mockUser.id;
  memo.updater = mockUser;
  memo.updatedAt = Date.now();
  return memo;
}

export async function deleteMemo(tripId: string, memoId: string) {
  const index = memos.findIndex((m) => m.id === memoId && m.tripId === tripId);
  if (index === -1) throw new Error(`Memo ${memoId} not found`);
  if (memos[index].createdBy !== mockUser.id) {
    throw new Error("Forbidden");
  }
  memos.splice(index, 1);
  return { success: true };
}
