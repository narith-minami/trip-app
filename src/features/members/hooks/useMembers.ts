/**
 * src/features/members/hooks/useMembers.ts
 *
 * Hook for fetching a trip's members.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "@/api/members";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { TripMember } from "@/types/entities";

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
