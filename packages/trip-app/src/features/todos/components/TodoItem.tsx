/**
 * src/features/todos/components/TodoItem.tsx
 *
 * Single todo row with a checkbox, priority, tags, assignee and delete control.
 */

import { useNavigate } from "@tanstack/react-router";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";
import { resolveTodoPriority } from "@/lib/todoPriority";
import { resolveTodoTag } from "@/lib/todoTags";
import { formatDueDate } from "@/lib/utils";
import type { Todo } from "@/types/entities";

export interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  disabled?: boolean;
}

function PriorityBadge({ priority }: { priority: Todo["priority"] }) {
  const meta = resolveTodoPriority(priority);
  return (
    <Badge variant="custom" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      優先度{meta.label}
    </Badge>
  );
}

function TagChip({ tag }: { tag: string }) {
  const meta = resolveTodoTag(tag);
  const Icon = meta.icon;
  return (
    <Badge variant="custom" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
      <Icon size={12} />
      {meta.label}
    </Badge>
  );
}

export function TodoItem({ todo, onToggle, onDelete, disabled = false }: TodoItemProps) {
  const navigate = useNavigate();
  const done = todo.isDone === 1;
  const hasMeta = todo.tags.length > 0;

  const openDetail = () => {
    void navigate({
      to: "/trips/$tripId/todos/$todoId",
      params: { tripId: todo.tripId, todoId: todo.id },
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-cream-dark bg-white p-3">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <Checkbox
          checked={done}
          disabled={disabled}
          onChange={() => onToggle(todo)}
          aria-label={`「${todo.title}」を完了にする`}
        />
        <span className="flex min-w-0 flex-col gap-1">
          <button
            type="button"
            onClick={openDetail}
            className={cn("truncate text-left", done ? "text-ink-light line-through" : "text-ink")}
          >
            {todo.title}
          </button>
          <span className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={todo.priority} />
            {todo.dueDate && <Badge variant="navy">期日 {formatDueDate(todo.dueDate)}</Badge>}
            {hasMeta && todo.tags.map((tag) => <TagChip key={tag} tag={tag} />)}
          </span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {todo.assignee && (
          <Avatar
            name={todo.assignee.name}
            image={todo.assignee.image}
            className="h-7 w-7 text-xs"
          />
        )}
        <Button size="sm" variant="ghost" disabled={disabled} onClick={() => onDelete(todo)}>
          削除
        </Button>
      </div>
    </div>
  );
}
