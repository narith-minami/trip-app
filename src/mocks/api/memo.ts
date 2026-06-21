/**
 * src/mocks/api/memo.ts
 *
 * Mock memo API. Get and update trip memo.
 */

const now = Date.now();

let memo = {
  tripId: "trip-1",
  content: "# 東京旅行メモ\n\n## 持ち物\n- カメラ\n- 防虫スプレー",
  updatedBy: null,
  updatedAt: now - 2 * 24 * 60 * 60 * 1000,
};

export async function fetchMemo(tripId: string) {
  if (memo.tripId !== tripId) {
    memo = {
      tripId,
      content: "",
      updatedBy: null,
      updatedAt: Date.now(),
    };
  }
  return memo;
}

export async function updateMemo(tripId: string, content: string) {
  if (memo.tripId !== tripId) {
    memo.tripId = tripId;
  }
  memo.content = content;
  memo.updatedAt = Date.now();
  return memo;
}
