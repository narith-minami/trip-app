/**
 * src/features/members/hooks/useMembers.ts
 *
 * Hook for fetching a trip's members.
 */

import { fetchMembers } from "@/api/members";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { TripMember } from "@/types/entities";
import { useQuery } from "@tanstack/react-query";

export function useMembers(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.members.list(tripId),
    queryFn: async () => {
      const res = await fetchMembers(tripId);
      return (res as { data: TripMember[] }).data;
    },
    enabled: !!tripId,
  });
}
