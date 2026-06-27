/**
 * src/features/todos/components/TodoForm.tsx
 *
 * Inline form for adding a todo, with an optional assignee select.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TripMember } from "@/types/entities";
import { useState } from "react";
import type { FormEvent } from "react";

export interface TodoFormValues {
  title: string;
  assigneeId?: string;
}

export interface TodoFormProps {
  members?: TripMember[];
  isSubmitting?: boolean;
  onSubmit: (values: TodoFormValues) => void;
}

// Stable default so the prop identity doesn't change every render (which would
// break memoised children comparing `members` by reference).
const EMPTY_MEMBERS: TripMember[] = [];

export function TodoForm({
  members = EMPTY_MEMBERS,
  isSubmitting = false,
  onSubmit,
}: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, assigneeId: assigneeId || undefined });
    setTitle("");
    setAssigneeId("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="やることを追加..."
        className="flex-1"
      />
      {members.length > 0 && (
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
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
    </form>
  );
}
