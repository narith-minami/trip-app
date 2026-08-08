/**
 * src/features/facilities/hooks/useFacilitySearch.ts
 *
 * Keyword search for external facility info (name/address/phone/coordinates),
 * triggered explicitly (search button), not on every keystroke.
 */

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { searchFacilities } from "@/api/facilities";

export function useFacilitySearch(tripId: string) {
  const search = useMutation({
    mutationFn: (query: string) => searchFacilities(tripId, query),
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "施設検索に失敗しました");
    },
  });

  return {
    results: search.data?.data ?? [],
    isSearching: search.isPending,
    search: (query: string) => search.mutate(query),
    reset: search.reset,
  };
}
