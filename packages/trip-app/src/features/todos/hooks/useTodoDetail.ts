/**
 * src/features/todos/hooks/useTodoDetail.ts
 *
 * Hook for fetching a single todo with comments for the detail view.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTodoDetail } from "@/api/todos";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { Todo, TodoComment } from "@/types/entities";

export type TodoDetail = Todo & { comments: TodoComment[] };

export function useTodoDetail(tripId: string, todoId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.todos.detail(tripId, todoId ?? ""),
    queryFn: async () => {
      const res = await fetchTodoDetail(tripId, todoId as string);
      // Normalize at the boundary: a response without `comments` must not crash
      // the whole detail screen.
      return { ...res, comments: res.comments ?? [] } as TodoDetail;
    },
    enabled: !!todoId,
  });
}
