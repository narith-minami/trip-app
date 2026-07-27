/**
 * src/features/todos/components/TodoEditForm.tsx
 *
 * Editable due date + description form for the todo detail panel.
 */

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export interface TodoEditFormProps {
  dueDate: string;
  onDueDateChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  onSave: (e: FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TodoEditForm({
  dueDate,
  onDueDateChange,
  description,
  onDescriptionChange,
  onSave,
  onCancel,
  isSubmitting,
}: TodoEditFormProps) {
  return (
    <form onSubmit={onSave} className="flex flex-col gap-3 border-t border-cream-dark pt-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="todo-dueDate" className="text-sm font-medium text-ink-muted">
          期日
        </label>
        <input
          id="todo-dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          className="w-fit rounded-xl border border-cream-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="todo-description" className="text-sm font-medium text-ink-muted">
          詳細
        </label>
        <Textarea
          id="todo-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          placeholder="詳細を入力（任意）"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          保存
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
