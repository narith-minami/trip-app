/**
 * src/features/trips/hooks/useTripDetail.ts
 *
 * Hook for fetching single trip details.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTrip } from "@/api/trips";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useTripDetail(tripId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.trips.detail(tripId || ""),
    queryFn: () => fetchTrip(tripId!),
    enabled: !!tripId,
  });
}
