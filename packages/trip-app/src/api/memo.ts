/**
 * src/api/memo.ts
 *
 * Memo (sticky note) API query functions.
 */

import { apiClient } from "./client";
import { unwrap, unwrapData } from "./unwrap";

/**
 * Fetch every memo for a trip (newest updated first).
 */
export async function fetchMemos(tripId: string) {
  return unwrapData(
    await apiClient.api.trips[":tripId"].memo.$get({
      param: { tripId },
    }),
    "Failed to fetch memos"
  );
}

/**
 * Create a memo.
 */
export async function createMemo(tripId: string, content: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].memo.$post({
      param: { tripId },
      json: { content },
    }),
    "Failed to create memo"
  );
}

/**
 * Update a memo's content.
 */
export async function updateMemo(tripId: string, memoId: string, content: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].memo[":memoId"].$put({
      param: { tripId, memoId },
      json: { content },
    }),
    "Failed to update memo"
  );
}

/**
 * Delete a memo.
 */
export async function deleteMemo(tripId: string, memoId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].memo[":memoId"].$delete({
      param: { tripId, memoId },
    }),
    "Failed to delete memo"
  );
}
