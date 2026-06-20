/**
 * src/api/memo.ts
 *
 * Memo API query functions.
 */

import { apiClient } from "./client";

/**
 * Fetch trip memo
 */
export async function fetchMemo(tripId: string) {
  const res = await apiClient.api.trips[":tripId"].memo.$get({
    param: { tripId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch memo");
  }
  return res.json();
}

/**
 * Update memo
 */
export async function updateMemo(tripId: string, content: string) {
  const res = await apiClient.api.trips[":tripId"].memo.$put({
    param: { tripId },
    json: { content },
  });
  if (!res.ok) {
    throw new Error("Failed to update memo");
  }
  return res.json();
}
