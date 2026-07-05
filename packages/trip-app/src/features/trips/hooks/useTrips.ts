/**
 * src/features/trips/hooks/useTrips.ts
 *
 * Hook for fetching user's trips list.
 */

import { fetchTrips } from "@/api/trips";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useTrips() {
  return useQuery({
    queryKey: QUERY_KEYS.trips.list(),
    queryFn: fetchTrips,
  });
}
