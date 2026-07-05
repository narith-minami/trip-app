/**
 * src/features/todos/hooks/useTodos.ts
 *
 * Hook for fetching a trip's todos.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTodos } from "@/api/todos";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { Todo } from "@/types/entities";

export function useTodos(tripId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.todos.list(tripId),
    queryFn: async () => {
      const res = await fetchTodos(tripId);
      return (res as { data: Todo[] }).data;
    },
    enabled: !!tripId,
  });
}
