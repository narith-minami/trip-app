/**
 * src/features/memo/hooks/useMemo.ts
 *
 * Hook for fetching a trip's shared memo.
 */

import { fetchMemo } from "@/api/memo";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { TripMemo } from "@/types/entities";
import { useQuery } from "@tanstack/react-query";

export function useTripMemo(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.memo.detail(tripId),
    queryFn: async () => {
      const res = await fetchMemo(tripId);
      return res as TripMemo;
    },
    enabled: !!tripId,
  });
}
