/**
 * src/features/todos/hooks/useTodos.ts
 *
 * Hook for fetching a trip's todos.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTodos } from "@/api/todos";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useTodos(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.todos.list(tripId),
    queryFn: () => fetchTodos(tripId),
    enabled: !!tripId,
  });
}
