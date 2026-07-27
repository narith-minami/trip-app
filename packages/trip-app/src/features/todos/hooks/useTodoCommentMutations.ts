/**
 * src/features/todos/hooks/useTodoCommentMutations.ts
 *
 * Create / delete mutations for todo comments. Invalidates the todo detail
 * cache (which embeds the comment timeline) so the chat view stays consistent.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTodoComment, deleteTodoComment } from "@/api/todoComments";
import { QUERY_KEYS } from "@/lib/queryKeys";

export function useTodoCommentMutations(tripId: string, todoId: string) {
  const queryClient = useQueryClient();

  // Comments are only ever rendered via the embedded detail query — the list
  // endpoint strips them — so invalidating todos.list here would be wasted work.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos.detail(tripId, todoId) });
  };

  const create = useMutation({
    mutationFn: (content: string) => createTodoComment(tripId, todoId, content),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (commentId: string) => deleteTodoComment(tripId, todoId, commentId),
    onSuccess: invalidate,
  });

  return { create, remove };
}
