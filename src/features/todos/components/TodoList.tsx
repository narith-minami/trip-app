/**
 * src/features/todos/components/TodoList.tsx
 *
 * Renders the list of todos, or an empty state when there are none.
 */

import { EmptyState } from "@/components/feedback/EmptyState";
import type { Todo } from "@/types/entities";
import { TodoItem } from "./TodoItem";

export interface TodoListProps {
  todos: Todo[];
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  pendingId?: string;
}

export function TodoList({ todos, onToggle, onDelete, pendingId }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <EmptyState
        icon="✅"
        title="No todos yet"
        description="Add tasks so everyone knows what's left to do."
      />
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          disabled={pendingId === todo.id}
        />
      ))}
    </div>
  );
}
