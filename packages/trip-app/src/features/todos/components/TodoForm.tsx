/**
 * src/features/todos/components/TodoForm.tsx
 *
 * Inline form for adding a todo. Assignee is optional; priority and preset
 * tags can be attached before submitting.
 */

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { DEFAULT_TODO_PRIORITY, TODO_PRIORITY_LIST, type TodoPriority } from "@/lib/todoPriority";
import { TODO_TAG_PRESET_LIST } from "@/lib/todoTags";
import type { TripMember } from "@/types/entities";

export interface TodoFormValues {
  title: string;
  assigneeId?: string;
  priority: TodoPriority;
  tags: string[];
}

export interface TodoFormProps {
  members?: TripMember[];
  isSubmitting?: boolean;
  onSubmit: (values: TodoFormValues) => void;
}

// Stable default so the prop identity doesn't change every render (which would
// break memoised children comparing `members` by reference).
const EMPTY_MEMBERS: TripMember[] = [];

interface TagSelectorProps {
  selected: string[];
  onToggle: (tag: string) => void;
}

function TagSelector({ selected, onToggle }: TagSelectorProps) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">タグ</legend>
      <div className="flex flex-wrap gap-2">
        {TODO_TAG_PRESET_LIST.map(({ tag, label, icon: Icon, color }) => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(tag)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                isSelected
                  ? "border-transparent text-white"
                  : "border-cream-dark bg-white text-ink-muted hover:border-ink-muted hover:text-ink"
              )}
              style={isSelected ? { backgroundColor: color, borderColor: color } : undefined}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function TodoForm({
  members = EMPTY_MEMBERS,
  isSubmitting = false,
  onSubmit,
}: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<TodoPriority>(DEFAULT_TODO_PRIORITY);
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, assigneeId: assigneeId || undefined, priority, tags });
    setTitle("");
    setAssigneeId("");
    setPriority(DEFAULT_TODO_PRIORITY);
    setTags([]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="やることを追加..."
          className="flex-1"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          aria-label="優先順位"
          className="rounded-xl border border-cream-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral"
        >
          {TODO_PRIORITY_LIST.map((p) => (
            <option key={p.key} value={p.key}>
              優先度: {p.label}
            </option>
          ))}
        </select>
        {members.length > 0 && (
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            aria-label="担当者"
            className="rounded-xl border border-cream-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral"
          >
            <option value="">未割り当て</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user?.name ?? member.userId}
              </option>
            ))}
          </select>
        )}
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          追加
        </Button>
      </div>

      <TagSelector selected={tags} onToggle={toggleTag} />
    </form>
  );
}
