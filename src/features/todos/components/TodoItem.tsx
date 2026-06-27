/**
 * src/features/todos/components/TodoItem.tsx
 *
 * Single todo row with a checkbox, assignee and delete control.
 */

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Todo } from "@/types/entities";

export interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  disabled?: boolean;
}

export function TodoItem({ todo, onToggle, onDelete, disabled = false }: TodoItemProps) {
  const done = todo.isDone === 1;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-cream-dark bg-white p-3">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={disabled}
          onChange={() => onToggle(todo)}
          className="h-4 w-4 rounded border-cream-dark text-coral focus:ring-coral"
        />
        <span className={cn("truncate", done ? "text-ink-light line-through" : "text-ink")}>
          {todo.title}
        </span>
      </label>

      <div className="flex shrink-0 items-center gap-2">
        {todo.assignee && (
          <Avatar
            name={todo.assignee.name}
            image={todo.assignee.image}
            className="h-7 w-7 text-xs"
          />
        )}
        <Button size="sm" variant="ghost" disabled={disabled} onClick={() => onDelete(todo)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
