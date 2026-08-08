/**
 * src/features/facilities/hooks/useFacilityDetail.ts
 *
 * Hook for fetching a single facility's detail.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchFacility } from "@/api/facilities";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useFacilityDetail(tripId: string, facilityId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.facilities.detail(tripId, facilityId ?? ""),
    queryFn: () => fetchFacility(tripId, facilityId as string),
    enabled: !!facilityId,
  });
}
