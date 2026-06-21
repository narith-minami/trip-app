/**
 * src/mocks/api/schedule.ts
 *
 * Mock schedule API. CRUD operations on schedule items.
 */

import type { ScheduleItem } from "@/types/entities";

const now = Date.now();

const mockScheduleItems = [
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
];

let scheduleItems = structuredClone(mockScheduleItems);

export async function fetchScheduleItems(tripId: string) {
  const items = scheduleItems
    .filter((s) => s.tripId === tripId)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.orderIndex - b.orderIndex;
    });

  return { data: items };
}

export async function createScheduleItem(
  tripId: string,
  data: {
    date: string;
    startTime?: string | null;
    title: string;
    placeName?: string | null;
    placeUrl?: string | null;
    memo?: string | null;
    orderIndex?: number;
  }
) {
  const newItem: ScheduleItem = {
    id: `schedule-${Date.now()}`,
    tripId,
    date: data.date,
    startTime: data.startTime ?? null,
    title: data.title,
    placeName: data.placeName ?? null,
    placeUrl: data.placeUrl ?? null,
    memo: data.memo ?? null,
    imageUrl: null,
    orderIndex: data.orderIndex ?? 0,
    updatedBy: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  scheduleItems.push(newItem);
  return newItem;
}

export async function updateScheduleItem(
  tripId: string,
  itemId: string,
  data: Partial<{
    date: string;
    startTime: string | null;
    title: string;
    placeName: string | null;
    placeUrl: string | null;
    memo: string | null;
    orderIndex: number;
  }>
) {
  const item = scheduleItems.find((s) => s.id === itemId && s.tripId === tripId);
  if (!item) throw new Error(`Schedule item ${itemId} not found`);

  Object.assign(item, data, { updatedAt: Date.now() });
  return item;
}

export async function deleteScheduleItem(tripId: string, itemId: string) {
  const index = scheduleItems.findIndex((s) => s.id === itemId && s.tripId === tripId);
  if (index === -1) throw new Error(`Schedule item ${itemId} not found`);

  scheduleItems.splice(index, 1);
  return { success: true };
}
