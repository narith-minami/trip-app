/**
 * src/features/todos/components/TodosSection.tsx
 *
 * Container for the trip detail "Todos" tab.
 */

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useTodoMutations } from "@/features/todos/hooks/useTodoMutations";
import { useTodos } from "@/features/todos/hooks/useTodos";
import type { Todo, TripMember } from "@/types/entities";
import { useState } from "react";
import { toast } from "sonner";
import { TodoForm, type TodoFormValues } from "./TodoForm";
import { TodoList } from "./TodoList";

export interface TodosSectionProps {
  tripId: string;
  members?: TripMember[];
}

export function TodosSection({ tripId, members }: TodosSectionProps) {
  const { data: todos, isLoading, error } = useTodos(tripId);
  const { create, update, remove } = useTodoMutations(tripId);
  // Track every in-flight todo id so rapid toggles don't clear each other's
  // pending state (a single string would race).
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

  const addPending = (id: string) => setPendingIds((prev) => new Set(prev).add(id));
  const clearPending = (id: string) =>
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const handleCreate = async (values: TodoFormValues) => {
    try {
      await create.mutateAsync(values);
    } catch {
      toast.error("Failed to add todo");
    }
  };

  const handleToggle = async (todo: Todo) => {
    addPending(todo.id);
    try {
      await update.mutateAsync({
        todoId: todo.id,
        data: { isDone: todo.isDone !== 1 },
      });
    } catch {
      toast.error("Failed to update todo");
    } finally {
      clearPending(todo.id);
    }
  };

  const handleDelete = async (todo: Todo) => {
    addPending(todo.id);
    try {
      await remove.mutateAsync(todo.id);
    } catch {
      toast.error("Failed to delete todo");
    } finally {
      clearPending(todo.id);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading todos..." />;
  if (error) return <p className="text-red-600">Failed to load todos.</p>;

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
