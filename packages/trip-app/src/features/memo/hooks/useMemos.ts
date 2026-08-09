/**
 * src/features/memo/hooks/useMemos.ts
 *
 * Hook for fetching a trip's memos (sticky notes), newest updated first.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchMemos } from "@/api/memo";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useMemos(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.memo.list(tripId),
    queryFn: () => fetchMemos(tripId),
    enabled: !!tripId,
  });
}
