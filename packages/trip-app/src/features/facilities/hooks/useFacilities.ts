/**
 * src/features/facilities/hooks/useFacilities.ts
 *
 * Hook for fetching a trip's facilities (施設・スポット).
 */

import { useQuery } from "@tanstack/react-query";
import { fetchFacilities } from "@/api/facilities";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { Facility } from "@/types/entities";

export function useFacilities(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.facilities.list(tripId),
    queryFn: async () => {
      const res = await fetchFacilities(tripId);
      return (res as { data: Facility[] }).data;
    },
    enabled: !!tripId,
  });
}
