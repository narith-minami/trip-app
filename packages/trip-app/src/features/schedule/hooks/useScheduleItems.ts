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

// Sentinel greater than any "HH:MM" value, so untimed items sort after timed ones.
const UNTIMED_SORT_KEY = "24:00";

function compareByStartTime(a: ScheduleItem, b: ScheduleItem): number {
  return (a.startTime || UNTIMED_SORT_KEY).localeCompare(b.startTime || UNTIMED_SORT_KEY);
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
