/**
 * src/features/schedule/hooks/useScheduleItems.ts
 *
 * Hook for fetching a trip's schedule items, grouped by date.
 */

import { fetchScheduleItems } from "@/api/schedule";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { ScheduleItem } from "@/types/entities";
import { useQuery } from "@tanstack/react-query";

export function useScheduleItems(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.schedule.list(tripId),
    queryFn: async () => {
      const res = await fetchScheduleItems(tripId);
      return (res as { data: ScheduleItem[] }).data;
    },
    enabled: !!tripId,
  });
}

/**
 * Group schedule items by their date, preserving the API ordering.
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
  return groups;
}
