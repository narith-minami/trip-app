/**
 * src/features/todos/components/TodoDetailHeader.tsx
 *
 * Title row for the todo detail panel: done toggle, title, and delete button.
 */

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface TodoDetailHeaderProps {
  title: string;
  done: boolean;
  isToggling: boolean;
  onToggle: () => void;
  isDeleting: boolean;
  onDelete: () => void;
}

export function TodoDetailHeader({
  title,
  done,
  isToggling,
  onToggle,
  isDeleting,
  onDelete,
}: TodoDetailHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={done}
        onChange={onToggle}
        disabled={isToggling}
        className="mt-1 h-5 w-5 rounded border-cream-dark text-coral focus:ring-coral"
        aria-label="完了"
      />
      <h1
        className={cn(
          "flex-1 text-xl font-bold",
          done ? "text-ink-light line-through" : "text-ink"
        )}
      >
        {title}
      </h1>
      <Button
        type="button"
        variant="ghost"
        className="shrink-0 px-2 text-red-600 hover:bg-red-50"
        aria-label="このTodoを削除"
        disabled={isDeleting}
        onClick={onDelete}
      >
        <Trash2 size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}
