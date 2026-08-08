/**
 * src/features/trips/lib/tripStatus.ts
 *
 * Derives the "あと◯日" / "開催中" / "終了" state shown on a trip's list
 * card from its start/end dates, per the Tabigo spec.
 */

import { DAY_MS, parseLocalDate } from "@/lib/japaneseDate";

export type TripStatus =
  | { type: "upcoming"; label: string }
  | { type: "ongoing"; label: string }
  | { type: "finished"; label: string };

export function getTripStatus(
  startDate: string,
  endDate: string,
  today: Date = new Date()
): TripStatus {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);

  if (t < start) {
    const diffDays = Math.ceil((start.getTime() - t.getTime()) / DAY_MS);
    return { type: "upcoming", label: `あと${diffDays}日` };
  }
  if (t <= end) {
    return { type: "ongoing", label: "開催中" };
  }
  return { type: "finished", label: "終了" };
}
