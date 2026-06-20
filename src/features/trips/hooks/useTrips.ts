/**
 * src/features/trips/hooks/useTrips.ts
 *
 * Hook for fetching user's trips list.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTrips } from "@/api/trips";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useTrips() {
  return useQuery({
    queryKey: QUERY_KEYS.trips.list(),
    queryFn: fetchTrips,
  });
}
