/**
 * src/features/todos/components/TodoCommentsSection.tsx
 *
 * Chat-style comment section for a todo. Owns comment mutations; the comment
 * list itself comes from the parent's detail query (embedded comments) so we
 * avoid a second fetch.
 */

import { toast } from "sonner";
import { useTodoCommentMutations } from "@/features/todos/hooks/useTodoCommentMutations";
import { usePendingIds } from "@/hooks/usePendingIds";
import type { TodoComment } from "@/types/entities";
import { TodoCommentInput } from "./TodoCommentInput";
import { TodoCommentList } from "./TodoCommentList";

export interface TodoCommentsSectionProps {
  tripId: string;
  todoId: string;
  comments: TodoComment[];
  currentUserId?: string;
}

export function TodoCommentsSection({
  tripId,
  todoId,
  comments,
  currentUserId,
}: TodoCommentsSectionProps) {
  const { create, remove } = useTodoCommentMutations(tripId, todoId);
  const { pendingIds, addPending, clearPending } = usePendingIds();

  const handleCreate = async (content: string) => {
    try {
      await create.mutateAsync(content);
    } catch {
      toast.error("コメントの投稿に失敗しました");
    }
  };

  const handleDelete = async (comment: TodoComment) => {
    addPending(comment.id);
    try {
      await remove.mutateAsync(comment.id);
    } catch {
      toast.error("コメントの削除に失敗しました");
    }
    clearPending(comment.id);
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-ink">コメント</h2>
      <TodoCommentList
        comments={comments}
        currentUserId={currentUserId}
        pendingIds={pendingIds}
        onDelete={handleDelete}
      />
      <TodoCommentInput isSubmitting={create.isPending} onSubmit={handleCreate} />
    </section>
  );
}
