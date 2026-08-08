/**
 * src/features/todos/hooks/useTodoDetailEdit.ts
 *
 * Edit-mode state and handlers for the todo detail panel: done toggle, and
 * description/due date editing. Local edit state is seeded only on user
 * action (not via useEffect), so background refetches never overwrite
 * in-flight input (AGENTS.md #2).
 */

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useTodoMutations } from "@/features/todos/hooks/useTodoMutations";
import type { TodoDetail as TodoDetailData } from "./useTodoDetail";

export function useTodoDetailEdit(tripId: string, todo: TodoDetailData) {
  const { update } = useTodoMutations(tripId);
  const done = todo.isDone === 1;

  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(todo.description ?? "");
  const [dueDate, setDueDate] = useState(todo.dueDate ?? "");

  const startEdit = () => {
    // Seed from the latest todo data at the moment the user enters edit mode.
    setDescription(todo.description ?? "");
    setDueDate(todo.dueDate ?? "");
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        todoId: todo.id,
        // Empty string → null so the field can be cleared (AGENTS.md #1).
        data: {
          description: description.trim() === "" ? null : description,
          dueDate: dueDate === "" ? null : dueDate,
        },
      },
      {
        onSuccess: () => {
          toast.success("保存しました");
          setEditing(false);
        },
        onError: () => toast.error("保存に失敗しました"),
      }
    );
  };

  const handleToggle = () => {
    update.mutate(
      { todoId: todo.id, data: { isDone: !done } },
      { onError: () => toast.error("更新に失敗しました") }
    );
  };

  return {
    done,
    editing,
    description,
    setDescription,
    dueDate,
    setDueDate,
    startEdit,
    cancelEdit,
    handleSave,
    handleToggle,
    isPending: update.isPending,
  };
}
