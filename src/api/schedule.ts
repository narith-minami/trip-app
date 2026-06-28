/**
 * src/api/schedule.ts
 *
 * Schedule API query functions.
 */

import type { EventType } from "@/lib/eventTypes";
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
    startTime?: string | null;
    endTime?: string | null;
    title: string;
    eventType?: EventType | null;
    placeName?: string | null;
    placeUrl?: string | null;
    memo?: string | null;
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
    startTime: string | null;
    endTime: string | null;
    title: string;
    eventType: EventType | null;
    placeName: string | null;
    placeUrl: string | null;
    memo: string | null;
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
 * Bulk reorder schedule items by updating their orderIndex values
 */
export async function reorderScheduleItems(
  tripId: string,
  items: Array<{ id: string; orderIndex: number }>
) {
  const res = await apiClient.api.trips[":tripId"].schedule.reorder.$patch({
    param: { tripId },
    json: { items },
  });
  if (!res.ok) {
    throw new Error("Failed to reorder schedule items");
  }
  return res.json();
}

/**
 * Bulk-copy schedule items to a different date
 */
export async function copyScheduleItems(
  tripId: string,
  data: { targetDate: string; itemIds: string[] }
) {
  const res = await apiClient.api.trips[":tripId"].schedule.copy.$post({
    param: { tripId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to copy schedule items");
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
