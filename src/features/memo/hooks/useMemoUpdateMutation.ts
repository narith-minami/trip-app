/**
 * src/features/memo/hooks/useMemoUpdateMutation.ts
 *
 * Mutation for saving a trip's shared memo content.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMemo } from "@/api/memo";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useMemoUpdateMutation(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => updateMemo(tripId, content),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.memo.all(tripId),
      }),
  });
}
