/**
 * src/mocks/api/schedule.ts
 *
 * Mock schedule API. CRUD operations on schedule items.
 */

import type { ScheduleItem } from "@/types/entities";

const now = Date.now();

const mockScheduleItems: ScheduleItem[] = [
  {
    id: "schedule-1",
    tripId: "trip-1",
    date: "2025-07-01",
    startTime: "09:00",
    endTime: "10:00",
    title: "羽田空港到着",
    placeName: "羽田空港",
    placeUrl: "https://www.haneda-airport.jp",
    memo: "ANA NH101 で到着予定",
    isTentative: 0,
    images: [],
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
    endTime: "13:00",
    title: "渋谷で昼食",
    placeName: "渋谷スクランブル交差点周辺",
    placeUrl: null,
    memo: "おしゃれなカフェを探す",
    isTentative: 0,
    images: [],
    orderIndex: 1,
    updatedBy: null,
    createdAt: now - 5 * 24 * 60 * 60 * 1000,
    updatedAt: now - 5 * 24 * 60 * 60 * 1000,
  },
];

const scheduleItems = structuredClone(mockScheduleItems);

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
    endTime?: string | null;
    title: string;
    isTentative?: boolean;
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
    endTime: data.endTime ?? null,
    title: data.title,
    isTentative: data.isTentative ? 1 : 0,
    placeName: data.placeName ?? null,
    placeUrl: data.placeUrl ?? null,
    memo: data.memo ?? null,
    images: [],
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
    isTentative: boolean;
    placeName: string | null;
    placeUrl: string | null;
    memo: string | null;
    orderIndex: number;
  }>
) {
  const item = scheduleItems.find((s) => s.id === itemId && s.tripId === tripId);
  if (!item) throw new Error(`Schedule item ${itemId} not found`);

  const { isTentative, ...rest } = data;
  Object.assign(item, rest, { updatedAt: Date.now() });
  if (isTentative !== undefined) item.isTentative = isTentative ? 1 : 0;
  return item;
}

export async function reorderScheduleItems(
  tripId: string,
  items: Array<{ id: string; orderIndex: number }>
) {
  for (const { id, orderIndex } of items) {
    const item = scheduleItems.find((s) => s.id === id && s.tripId === tripId);
    if (item) {
      item.orderIndex = orderIndex;
      item.updatedAt = Date.now();
    }
  }
  return { success: true };
}

export async function copyScheduleItems(
  tripId: string,
  data: { targetDate: string; itemIds: string[] }
) {
  const source = scheduleItems.filter((s) => s.tripId === tripId && data.itemIds.includes(s.id));
  const created: ScheduleItem[] = source.map((item) => ({
    ...item,
    id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: data.targetDate,
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
  scheduleItems.push(...created);
  return { data: created, count: created.length };
}

export async function deleteScheduleItem(tripId: string, itemId: string) {
  const index = scheduleItems.findIndex((s) => s.id === itemId && s.tripId === tripId);
  if (index === -1) throw new Error(`Schedule item ${itemId} not found`);

  scheduleItems.splice(index, 1);
  return { success: true };
}

/**
 * Mock image upload: reads the file as a base64 data URL (no R2 in mock mode)
 * and appends it to the item's photo list, mirroring how `scraps.imageData`
 * works but keeping every upload instead of replacing the last one.
 */
export async function uploadScheduleItemImage(tripId: string, itemId: string, file: File) {
  const item = scheduleItems.find((s) => s.id === itemId && s.tripId === tripId);
  if (!item) throw new Error(`Schedule item ${itemId} not found`);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const image = {
    id: `scheduleImage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    scheduleItemId: itemId,
    imageUrl: dataUrl,
    orderIndex: item.images.length,
    createdAt: Date.now(),
  };
  item.images.push(image);
  item.updatedAt = Date.now();
  return image;
}

export async function deleteScheduleItemImage(tripId: string, itemId: string, imageId: string) {
  const item = scheduleItems.find((s) => s.id === itemId && s.tripId === tripId);
  if (!item) throw new Error(`Schedule item ${itemId} not found`);

  item.images = item.images.filter((image) => image.id !== imageId);
  item.updatedAt = Date.now();
  return { success: true };
}
