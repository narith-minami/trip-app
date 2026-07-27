/**
 * src/features/todos/components/TodoCommentList.tsx
 *
 * Chat-style timeline of todo comments. The current user's comments render
 * on the right with a delete control; others on the left.
 */

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { TodoComment } from "@/types/entities";

export interface TodoCommentListProps {
  comments: TodoComment[];
  currentUserId?: string;
  pendingIds?: ReadonlySet<string>;
  onDelete?: (comment: TodoComment) => void;
}

function formatChatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TodoCommentList({
  comments,
  currentUserId,
  pendingIds,
  onDelete,
}: TodoCommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-light">
        まだコメントはありません。メンバーとやりとりしましょう。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => {
        const mine = comment.authorId === currentUserId;
        return (
          <div
            key={comment.id}
            className={cn("flex gap-2", mine ? "flex-row-reverse" : "flex-row")}
          >
            <Avatar
              name={comment.author?.name ?? "?"}
              image={comment.author?.image}
              className="h-7 w-7 shrink-0 text-xs"
            />
            <div className={cn("flex max-w-[80%] flex-col", mine ? "items-end" : "items-start")}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-ink-muted">
                  {comment.author?.name ?? "不明"}
                </span>
                <span className="text-xs text-ink-light">{formatChatTime(comment.createdAt)}</span>
              </div>
              <div
                className={cn(
                  "mt-1 whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                  mine ? "bg-coral text-white" : "bg-cream-mid text-ink"
                )}
              >
                {comment.content}
              </div>
              {mine && onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pendingIds?.has(comment.id)}
                  onClick={() => onDelete(comment)}
                  className="mt-0.5 h-6 px-2 text-xs text-ink-light hover:text-red-600"
                >
                  削除
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
