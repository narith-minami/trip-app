/**
 * src/features/schedule/hooks/useScheduleMutations.ts
 *
 * Create / update / delete mutations for schedule items.
 * Each mutation invalidates the schedule list cache on success.
 */

import { createScheduleItem, deleteScheduleItem, updateScheduleItem } from "@/api/schedule";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateInput = Parameters<typeof createScheduleItem>[1];
type UpdateInput = Parameters<typeof updateScheduleItem>[2];

export function useScheduleMutations(tripId: string) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.schedule.all(tripId),
    });

  const create = useMutation({
    mutationFn: (data: CreateInput) => createScheduleItem(tripId, data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateInput }) =>
      updateScheduleItem(tripId, itemId, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (itemId: string) => deleteScheduleItem(tripId, itemId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
