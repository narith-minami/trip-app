/**
 * src/features/todos/components/TodosSection.tsx
 *
 * Container for the trip detail "Todos" tab.
 */

import { toast } from "sonner";
import { QueryBoundary } from "@/components/feedback/QueryBoundary";
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
    if (!window.confirm(`「${todo.title}」を削除しますか？`)) return;
    addPending(todo.id);
    remove.mutate(todo.id, {
      onSuccess: () => toast.success("Todoを削除しました"),
      onError: () => toast.error("Todoの削除に失敗しました"),
      onSettled: () => clearPending(todo.id),
    });
  };

  return (
    <QueryBoundary
      isLoading={isLoading}
      error={error}
      loadingLabel="Todoを読み込み中..."
      errorMessage="Todoの読み込みに失敗しました。"
    >
      <div className="space-y-4">
        <TodoForm members={members} isSubmitting={create.isPending} onSubmit={handleCreate} />
        <TodoList
          todos={todos ?? []}
          onToggle={handleToggle}
          onDelete={handleDelete}
          pendingIds={pendingIds}
        />
      </div>
    </QueryBoundary>
  );
}
