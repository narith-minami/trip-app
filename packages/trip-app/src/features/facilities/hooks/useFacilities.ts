/**
 * src/features/facilities/hooks/useFacilities.ts
 *
 * Hook for fetching a trip's facilities (施設・スポット).
 */

import { useQuery } from "@tanstack/react-query";
import { fetchFacilities } from "@/api/facilities";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useFacilities(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.facilities.list(tripId),
    queryFn: () => fetchFacilities(tripId),
    enabled: !!tripId,
  });
}
