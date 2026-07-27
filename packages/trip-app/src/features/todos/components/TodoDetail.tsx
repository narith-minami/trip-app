/**
 * src/features/todos/components/TodoDetail.tsx
 *
 * Detail panel for a single todo: title, meta (priority, assignee, tags),
 * editable description and due date, done toggle, and the comments chat.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { TripMember } from "@/types/entities";
import type { TodoDetail as TodoDetailData } from "../hooks/useTodoDetail";
import { useTodoDetailEdit } from "../hooks/useTodoDetailEdit";
import { TodoCommentsSection } from "./TodoCommentsSection";
import { TodoEditForm } from "./TodoEditForm";
import { TodoMetaRow } from "./TodoMetaRow";

export interface TodoDetailProps {
  tripId: string;
  todo: TodoDetailData;
  members?: TripMember[];
  currentUserId?: string;
}

export function TodoDetail({ tripId, todo, members, currentUserId }: TodoDetailProps) {
  const {
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
    isPending,
  } = useTodoDetailEdit(tripId, todo);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-4">
        {/* Title + done toggle */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={done}
            onChange={handleToggle}
            disabled={isPending}
            className="mt-1 h-5 w-5 rounded border-cream-dark text-coral focus:ring-coral"
            aria-label="完了"
          />
          <h1
            className={cn("text-xl font-bold", done ? "text-ink-light line-through" : "text-ink")}
          >
            {todo.title}
          </h1>
        </div>

        {/* Meta row */}
        <TodoMetaRow todo={todo} members={members} showDueDate={!editing} />

        {/* Description / due date editor */}
        {editing ? (
          <TodoEditForm
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            description={description}
            onDescriptionChange={setDescription}
            onSave={handleSave}
            onCancel={cancelEdit}
            isSubmitting={isPending}
          />
        ) : (
          <div className="border-t border-cream-dark pt-3">
            {todo.description ? (
              <p className="whitespace-pre-wrap break-words text-ink">{todo.description}</p>
            ) : (
              <p className="text-sm text-ink-light">詳細はありません</p>
            )}
            <Button size="sm" variant="ghost" onClick={startEdit} className="mt-2">
              編集
            </Button>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <TodoCommentsSection
          tripId={tripId}
          todoId={todo.id}
          comments={todo.comments}
          currentUserId={currentUserId}
        />
      </Card>
    </div>
  );
}
