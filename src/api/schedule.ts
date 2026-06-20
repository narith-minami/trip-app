/**
 * src/api/schedule.ts
 *
 * Schedule API query functions.
 */

import { apiClient } from "./client";

/**
 * Fetch schedule items for a trip
 */
export async function fetchScheduleItems(tripId: string) {
  const res = await apiClient.api.trips[":tripId"].schedule.$get({
    param: { tripId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch schedule items");
  }
  return res.json();
}

/**
 * Create schedule item
 */
export async function createScheduleItem(
  tripId: string,
  data: {
    date: string;
    startTime?: string;
    title: string;
    placeName?: string;
    placeUrl?: string;
    memo?: string;
    orderIndex?: number;
  }
) {
  const res = await apiClient.api.trips[":tripId"].schedule.$post({
    param: { tripId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to create schedule item");
  }
  return res.json();
}

/**
 * Update schedule item
 */
export async function updateScheduleItem(
  tripId: string,
  itemId: string,
  data: Partial<{
    date: string;
    startTime: string;
    title: string;
    placeName: string;
    placeUrl: string;
    memo: string;
    orderIndex: number;
  }>
) {
  const res = await apiClient.api.trips[":tripId"].schedule[":itemId"].$put({
    param: { tripId, itemId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to update schedule item");
  }
  return res.json();
}

/**
 * Delete schedule item
 */
export async function deleteScheduleItem(tripId: string, itemId: string) {
  const res = await apiClient.api.trips[":tripId"].schedule[":itemId"].$delete({
    param: { tripId, itemId },
  });
  if (!res.ok) {
    throw new Error("Failed to delete schedule item");
  }
  return res.json();
}
