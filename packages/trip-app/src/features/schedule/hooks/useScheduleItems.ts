/**
 * src/features/schedule/hooks/useScheduleItems.ts
 *
 * Hook for fetching a trip's schedule items, grouped by date.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchScheduleItems } from "@/api/schedule";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { ScheduleItem } from "@/types/entities";

export function useScheduleItems(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.schedule.list(tripId),
    queryFn: () => fetchScheduleItems(tripId),
    enabled: !!tripId,
  });
}

function hasStartTime(item: ScheduleItem): boolean {
  return typeof item.startTime === "string" && item.startTime.length > 0;
}

function compareByStartTime(a: ScheduleItem, b: ScheduleItem): number {
  const aHasTime = hasStartTime(a);
  const bHasTime = hasStartTime(b);

  // If both have times, compare them
  if (aHasTime && bHasTime) {
    return a.startTime.localeCompare(b.startTime);
  }

  // Items with times come before untimed items
  if (aHasTime) return -1;
  if (bHasTime) return 1;

  // Both untimed, preserve original order
  return 0;
}

/**
 * Group schedule items by their date and sort by start time (earliest first).
 */
export function groupByDate(items: ScheduleItem[]): Map<string, ScheduleItem[]> {
  const groups = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    const bucket = groups.get(item.date);
    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(item.date, [item]);
    }
  }

  // Sort items within each date by start time (earliest first)
  for (const bucket of groups.values()) {
    bucket.sort(compareByStartTime);
  }

  return groups;
}
