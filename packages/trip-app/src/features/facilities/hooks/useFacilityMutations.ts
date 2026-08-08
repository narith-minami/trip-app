/**
 * src/features/facilities/hooks/useFacilityMutations.ts
 *
 * Create / update / delete mutations for facilities.
 * Invalidates both the facilities cache and the schedule cache on success,
 * since schedule items can embed a linked facility.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFacility, deleteFacility, updateFacility } from "@/api/facilities";
import { QUERY_KEYS } from "@/lib/queryKeys";

type CreateInput = Parameters<typeof createFacility>[1];
type UpdateInput = Parameters<typeof updateFacility>[2];

export function useFacilityMutations(tripId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.facilities.all(tripId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule.all(tripId) });
  };

  const create = useMutation({
    mutationFn: (data: CreateInput) => createFacility(tripId, data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ facilityId, data }: { facilityId: string; data: UpdateInput }) =>
      updateFacility(tripId, facilityId, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (facilityId: string) => deleteFacility(tripId, facilityId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
