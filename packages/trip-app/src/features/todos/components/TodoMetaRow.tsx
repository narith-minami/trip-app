/**
 * src/features/todos/components/TodoMetaRow.tsx
 *
 * Priority badge, assignee, due date and tags for the todo detail header.
 */

import { Avatar } from "@/components/ui/avatar";
import { formatMD } from "@/lib/japaneseDate";
import { resolveTodoPriority } from "@/lib/todoPriority";
import { resolveTodoTag } from "@/lib/todoTags";
import type { TripMember } from "@/types/entities";
import type { TodoDetail as TodoDetailData } from "../hooks/useTodoDetail";

export interface TodoMetaRowProps {
  todo: TodoDetailData;
  members?: TripMember[];
  showDueDate: boolean;
}

export function TodoMetaRow({ todo, members, showDueDate }: TodoMetaRowProps) {
  const priorityMeta = resolveTodoPriority(todo.priority);
  const assignee = members?.find((m) => m.userId === todo.assigneeId)?.user ?? todo.assignee;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: `${priorityMeta.color}20`, color: priorityMeta.color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: priorityMeta.color }}
        />
        優先度{priorityMeta.label}
      </span>
      {assignee && (
        <span className="inline-flex items-center gap-1.5">
          <Avatar name={assignee.name} image={assignee.image} className="h-6 w-6 text-xs" />
          <span className="text-ink-muted">{assignee.name}</span>
        </span>
      )}
      {showDueDate && todo.dueDate && (
        <span className="text-ink-muted">期日: {formatMD(todo.dueDate)}</span>
      )}
      {todo.tags.map((tag) => {
        const meta = resolveTodoTag(tag);
        const Icon = meta.icon;
        return (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
          >
            <Icon size={12} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
