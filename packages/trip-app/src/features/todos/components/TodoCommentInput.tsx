/**
 * src/features/todos/components/TodoCommentInput.tsx
 *
 * Sticky composer for posting a comment. Enter sends, Shift+Enter inserts a
 * newline. Disabled while empty or submitting (AGENTS.md #23).
 */

import type { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { TODO_COMMENT_MAX } from "@/lib/schemas/todo";

export interface TodoCommentInputProps {
  isSubmitting?: boolean;
  onSubmit: (content: string) => void;
}

export function TodoCommentInput({ isSubmitting = false, onSubmit }: TodoCommentInputProps) {
  const [content, setContent] = useState("");

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && !isSubmitting;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed);
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter allows a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        onSubmit(trimmed);
        setContent("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-cream-dark pt-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="コメントを入力"
        placeholder="コメントを入力..."
        rows={1}
        maxLength={TODO_COMMENT_MAX}
        className="max-h-32 flex-1 resize-none"
      />
      <Button type="submit" size="sm" disabled={!canSubmit}>
        送信
      </Button>
    </form>
  );
}
