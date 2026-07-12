/**
 * src/features/scraps/hooks/useScraps.ts
 *
 * Hook for fetching all scraps.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchScraps } from "@/api/scraps";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { Scrap } from "@/types/entities";

export function useScraps(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.scraps.list(),
    queryFn: async () => {
      const res = await fetchScraps();
      return (res as { data: Scrap[] }).data;
    },
    ...options,
  });
}
