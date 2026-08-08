/**
 * src/api/schedule.ts
 *
 * Schedule API query functions.
 */

import type { EventType } from "@/lib/eventTypes";
import { apiClient } from "./client";
import { unwrap, unwrapData } from "./unwrap";

/**
 * Fetch schedule items for a trip
 */
export async function fetchScheduleItems(tripId: string) {
  return unwrapData(
    await apiClient.api.trips[":tripId"].schedule.$get({
      param: { tripId },
    }),
    "Failed to fetch schedule items"
  );
}

/**
 * Create schedule item
 */
export async function createScheduleItem(
  tripId: string,
  data: {
    date: string;
    startTime?: string | null;
    endTime?: string | null;
    title: string;
    eventType?: EventType | null;
    isTentative?: boolean;
    placeName?: string | null;
    placeUrl?: string | null;
    memo?: string | null;
    facilityId?: string | null;
    orderIndex?: number;
  }
) {
  return unwrap(
    await apiClient.api.trips[":tripId"].schedule.$post({
      param: { tripId },
      json: data,
    }),
    "Failed to create schedule item"
  );
}

/**
 * Update schedule item
 */
export async function updateScheduleItem(
  tripId: string,
  itemId: string,
  data: Partial<{
    date: string;
    startTime: string | null;
    endTime: string | null;
    title: string;
    eventType: EventType | null;
    isTentative: boolean;
    placeName: string | null;
    placeUrl: string | null;
    memo: string | null;
    facilityId: string | null;
    orderIndex: number;
  }>
) {
  return unwrap(
    await apiClient.api.trips[":tripId"].schedule[":itemId"].$put({
      param: { tripId, itemId },
      json: data,
    }),
    "Failed to update schedule item"
  );
}

/**
 * Bulk reorder schedule items by updating their orderIndex values
 */
export async function reorderScheduleItems(
  tripId: string,
  items: Array<{ id: string; orderIndex: number }>
) {
  return unwrap(
    await apiClient.api.trips[":tripId"].schedule.reorder.$patch({
      param: { tripId },
      json: { items },
    }),
    "Failed to reorder schedule items"
  );
}

/**
 * Bulk-copy schedule items to a different date
 */
export async function copyScheduleItems(
  tripId: string,
  data: { targetDate: string; itemIds: string[] }
) {
  return unwrap(
    await apiClient.api.trips[":tripId"].schedule.copy.$post({
      param: { tripId },
      json: data,
    }),
    "Failed to copy schedule items"
  );
}

/**
 * Delete schedule item
 */
export async function deleteScheduleItem(tripId: string, itemId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].schedule[":itemId"].$delete({
      param: { tripId, itemId },
    }),
    "Failed to delete schedule item"
  );
}

/**
 * Upload a photo for a schedule item.
 *
 * Uses a raw `fetch` instead of the Hono RPC client: the server handler reads
 * `c.req.formData()` directly (no `zValidator("form", ...)`), so `hc` has no
 * typed multipart body to offer here — the same reason `cover.ts` has no RPC
 * client wrapper.
 */
export async function uploadScheduleItemImage(tripId: string, itemId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/trips/${tripId}/schedule/${itemId}/images`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Failed to upload schedule item image");
  }
  return res.json();
}

/**
 * Delete a single photo from a schedule item
 */
export async function deleteScheduleItemImage(tripId: string, itemId: string, imageId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].schedule[":itemId"].images[":imageId"].$delete({
      param: { tripId, itemId, imageId },
    }),
    "Failed to delete schedule item image"
  );
}
