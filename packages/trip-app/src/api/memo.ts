/**
 * src/api/memo.ts
 *
 * Memo API query functions.
 */

import { apiClient } from "./client";
import { unwrap } from "./unwrap";

/**
 * Fetch trip memo
 */
export async function fetchMemo(tripId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].memo.$get({
      param: { tripId },
    }),
    "Failed to fetch memo"
  );
}

/**
 * Update memo
 */
export async function updateMemo(tripId: string, content: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].memo.$put({
      param: { tripId },
      json: { content },
    }),
    "Failed to update memo"
  );
}
