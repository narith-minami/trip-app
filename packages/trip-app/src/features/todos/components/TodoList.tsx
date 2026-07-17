/**
 * src/features/todos/components/TodoList.tsx
 *
 * Renders the list of todos, or an empty state when there are none.
 * Ordered incomplete-first, then by priority (high → low).
 */

import { useMemo } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { todoPriorityOrder } from "@/lib/todoPriority";
import type { Todo } from "@/types/entities";
import { TodoItem } from "./TodoItem";

export interface TodoListProps {
  todos: Todo[];
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  pendingIds?: ReadonlySet<string>;
}

function compareTodos(a: Todo, b: Todo): number {
  // Incomplete items rise above completed ones.
  if (a.isDone !== b.isDone) return a.isDone - b.isDone;
  // Then higher priority first (lower order value = higher priority).
  const priorityDelta = todoPriorityOrder(a.priority) - todoPriorityOrder(b.priority);
  if (priorityDelta !== 0) return priorityDelta;
  // Stable tie-breaker: oldest first.
  return a.createdAt - b.createdAt;
}

export function TodoList({ todos, onToggle, onDelete, pendingIds }: TodoListProps) {
  const sorted = useMemo(() => [...todos].sort(compareTodos), [todos]);

  if (todos.length === 0) {
    return (
      <EmptyState
        icon="✅"
        title="やることはまだありません"
        description="タスクを追加してみんなで共有しましょう。"
      />
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          disabled={pendingIds?.has(todo.id)}
        />
      ))}
    </div>
  );
}
