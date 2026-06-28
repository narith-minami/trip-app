/**
 * src/features/schedule/hooks/useScheduleMutations.ts
 *
 * Create / update / delete mutations for schedule items.
 * Each mutation invalidates the schedule list cache on success.
 */

import {
  copyScheduleItems,
  createScheduleItem,
  deleteScheduleItem,
  reorderScheduleItems,
  updateScheduleItem,
} from "@/api/schedule";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { ScheduleItem } from "@/types/entities";
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

  const reorder = useMutation({
    mutationFn: (items: Array<{ id: string; orderIndex: number }>) =>
      reorderScheduleItems(tripId, items),
    onMutate: async (reorderedItems) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.schedule.list(tripId) });
      const previous = queryClient.getQueryData<ScheduleItem[]>(QUERY_KEYS.schedule.list(tripId));
      queryClient.setQueryData<ScheduleItem[]>(QUERY_KEYS.schedule.list(tripId), (old) => {
        if (!old) return old;
        const indexMap = new Map(reorderedItems.map((r) => [r.id, r.orderIndex]));
        return old
          .map((item) =>
            indexMap.has(item.id) ? { ...item, orderIndex: indexMap.get(item.id)! } : item
          )
          .sort((a, b) => a.date.localeCompare(b.date) || a.orderIndex - b.orderIndex);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.schedule.list(tripId), context.previous);
      }
    },
    onSettled: invalidate,
  });

  const copy = useMutation({
    mutationFn: (data: { targetDate: string; itemIds: string[] }) =>
      copyScheduleItems(tripId, data),
    onSuccess: invalidate,
  });

  return { create, update, remove, reorder, copy };
}
