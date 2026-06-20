/**
 * src/features/todos/hooks/useTodoMutations.ts
 *
 * Create / update / delete mutations for todos.
 * Each mutation invalidates the todos list cache on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTodo, updateTodo, deleteTodo } from "@/api/todos";
import { QUERY_KEYS } from "@/lib/queryKeys";

type CreateInput = Parameters<typeof createTodo>[1];
type UpdateInput = Parameters<typeof updateTodo>[2];

export function useTodoMutations(tripId: string) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.todos.all(tripId),
    });

  const create = useMutation({
    mutationFn: (data: CreateInput) => createTodo(tripId, data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ todoId, data }: { todoId: string; data: UpdateInput }) =>
      updateTodo(tripId, todoId, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (todoId: string) => deleteTodo(tripId, todoId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
