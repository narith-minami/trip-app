/**
 * src/features/todos/components/TodoForm.tsx
 *
 * Inline form for adding a todo, with an optional assignee select.
 */

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TripMember } from "@/types/entities";

export interface TodoFormValues {
  title: string;
  assigneeId?: string;
}

export interface TodoFormProps {
  members?: TripMember[];
  isSubmitting?: boolean;
  onSubmit: (values: TodoFormValues) => void;
}

export function TodoForm({ members = [], isSubmitting = false, onSubmit }: TodoFormProps) {
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
        placeholder="Add a todo..."
        className="flex-1"
      />
      {members.length > 0 && (
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.user?.name ?? member.userId}
            </option>
          ))}
        </select>
      )}
      <Button type="submit" disabled={isSubmitting || !title.trim()}>
        Add
      </Button>
    </form>
  );
}
