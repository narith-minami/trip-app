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
  pendingIds?: ReadonlySet<string>;
}

export function TodoList({ todos, onToggle, onDelete, pendingIds }: TodoListProps) {
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
      {todos.map((todo) => (
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
