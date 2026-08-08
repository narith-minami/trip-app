/**
 * src/features/members/hooks/useMembers.ts
 *
 * Hook for fetching a trip's members.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchMembers } from "@/api/members";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useMembers(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.members.list(tripId),
    queryFn: () => fetchMembers(tripId),
    enabled: !!tripId,
  });
}
