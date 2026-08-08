/**
 * src/features/members/hooks/useMemberMutations.ts
 *
 * Remove mutation for trip members. Invalidates the members list on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMember } from "@/api/members";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useMemberMutations(tripId: string) {
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: (memberId: string) => removeMember(tripId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.members.all(tripId) }),
  });

  return { remove };
}
