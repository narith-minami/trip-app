/**
 * src/features/scraps/hooks/useScrapMutations.ts
 *
 * Create / update / delete mutations for scraps.
 * Each mutation invalidates the scraps list cache on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScrap, deleteScrap, type ScrapInput, updateScrap } from "@/api/scraps";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useScrapMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.scraps.all(),
    });

  const create = useMutation({
    mutationFn: (data: ScrapInput) => createScrap(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ scrapId, data }: { scrapId: string; data: ScrapInput }) =>
      updateScrap(scrapId, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (scrapId: string) => deleteScrap(scrapId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
