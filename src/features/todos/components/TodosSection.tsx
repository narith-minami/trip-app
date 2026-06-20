/**
 * src/features/todos/components/TodosSection.tsx
 *
 * Container for the trip detail "Todos" tab.
 */

import { useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useTodos } from "@/features/todos/hooks/useTodos";
import { useTodoMutations } from "@/features/todos/hooks/useTodoMutations";
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
  const [pendingId, setPendingId] = useState<string | undefined>();

  const handleCreate = async (values: TodoFormValues) => {
    try {
      await create.mutateAsync(values);
    } catch {
      toast.error("Failed to add todo");
    }
  };

  const handleToggle = async (todo: Todo) => {
    setPendingId(todo.id);
    try {
      await update.mutateAsync({
        todoId: todo.id,
        data: { isDone: todo.isDone !== 1 },
      });
    } catch {
      toast.error("Failed to update todo");
    } finally {
      setPendingId(undefined);
    }
  };

  const handleDelete = async (todo: Todo) => {
    setPendingId(todo.id);
    try {
      await remove.mutateAsync(todo.id);
    } catch {
      toast.error("Failed to delete todo");
    } finally {
      setPendingId(undefined);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading todos..." />;
  if (error) return <p className="text-red-600">Failed to load todos.</p>;

  return (
    <div className="space-y-4">
      <TodoForm
        members={members}
        isSubmitting={create.isPending}
        onSubmit={handleCreate}
      />
      <TodoList
        todos={todos ?? []}
        onToggle={handleToggle}
        onDelete={handleDelete}
        pendingId={pendingId}
      />
    </div>
  );
}
