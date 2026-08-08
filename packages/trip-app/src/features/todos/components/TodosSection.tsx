/**
 * src/features/todos/components/TodosSection.tsx
 *
 * Container for the trip detail "Todos" tab.
 */

import { toast } from "sonner";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useTodoMutations } from "@/features/todos/hooks/useTodoMutations";
import { useTodos } from "@/features/todos/hooks/useTodos";
import { usePendingIds } from "@/hooks/usePendingIds";
import type { Todo, TripMember } from "@/types/entities";
import { TodoForm, type TodoFormValues } from "./TodoForm";
import { TodoList } from "./TodoList";

export interface TodosSectionProps {
  tripId: string;
  members?: TripMember[];
}

export function TodosSection({ tripId, members }: TodosSectionProps) {
  const { data: todos, isLoading, error } = useTodos(tripId);
  const { create, update, remove } = useTodoMutations(tripId);
  const { pendingIds, addPending, clearPending } = usePendingIds();

  const handleCreate = (values: TodoFormValues) => {
    create.mutate(values, { onError: () => toast.error("Todoの追加に失敗しました") });
  };

  const handleToggle = (todo: Todo) => {
    addPending(todo.id);
    update.mutate(
      { todoId: todo.id, data: { isDone: todo.isDone !== 1 } },
      {
        onError: () => toast.error("Todoの更新に失敗しました"),
        onSettled: () => clearPending(todo.id),
      }
    );
  };

  const handleDelete = (todo: Todo) => {
    addPending(todo.id);
    remove.mutate(todo.id, {
      onError: () => toast.error("Todoの削除に失敗しました"),
      onSettled: () => clearPending(todo.id),
    });
  };

  if (isLoading) return <LoadingSpinner label="Todoを読み込み中..." />;
  if (error) return <p className="text-red-600">Todoの読み込みに失敗しました。</p>;

  return (
    <div className="space-y-4">
      <TodoForm members={members} isSubmitting={create.isPending} onSubmit={handleCreate} />
      <TodoList
        todos={todos ?? []}
        onToggle={handleToggle}
        onDelete={handleDelete}
        pendingIds={pendingIds}
      />
    </div>
  );
}
