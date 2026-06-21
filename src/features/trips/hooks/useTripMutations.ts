/**
 * src/features/trips/hooks/useTripMutations.ts
 *
 * Hooks for trip mutations (create, update, delete).
 */

import { createTrip, deleteTrip, updateTrip } from "@/api/trips";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook for creating a new trip
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.trips.list(),
      });
    },
  });
}

/**
 * Hook for updating a trip
 */
export function useUpdateTrip(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateTrip>[1]) => updateTrip(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.trips.detail(tripId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.trips.list(),
      });
    },
  });
}

/**
 * Hook for deleting a trip
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.trips.list(),
      });
    },
  });
}
