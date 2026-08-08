/**
 * src/features/trips/lib/tripStatus.ts
 *
 * Derives the "あと◯日" / "開催中" / "終了" state shown on a trip's list
 * card from its start/end dates, per the Tabigo spec.
 */

export type TripStatus =
  | { type: "upcoming"; label: string }
  | { type: "ongoing"; label: string }
  | { type: "finished"; label: string };

/** Parses a `YYYY-MM-DD` string as a local-timezone date (avoids the UTC-midnight shift `new Date(str)` causes). */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

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
    const diffDays = Math.ceil((start.getTime() - t.getTime()) / 86400000);
    return { type: "upcoming", label: `あと${diffDays}日` };
  }
  if (t <= end) {
    return { type: "ongoing", label: "開催中" };
  }
  return { type: "finished", label: "終了" };
}

export { parseLocalDate };
