/**
 * src/features/memo/hooks/useMemoMutations.ts
 *
 * Create / update / delete mutations for a trip's memos.
 * Each mutation invalidates the memo list cache on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMemo, deleteMemo, updateMemo } from "@/api/memo";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useMemoMutations(tripId: string) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.memo.all(tripId),
    });

  const create = useMutation({
    mutationFn: (content: string) => createMemo(tripId, content),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ memoId, content }: { memoId: string; content: string }) =>
      updateMemo(tripId, memoId, content),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (memoId: string) => deleteMemo(tripId, memoId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
