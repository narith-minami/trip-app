/**
 * src/features/memo/components/MemoForm.tsx
 *
 * Shared create/edit form for a memo (sticky note): body text only. Used by
 * MemoComposer (create) and MemoCard (inline edit).
 */

import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { MEMO_CONTENT_MAX } from "@/lib/schemas/memo";

interface MemoFormProps {
  initial?: string;
  submitLabel: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  resetOnSubmit?: boolean;
}

export function MemoForm({
  initial = "",
  submitLabel,
  onSubmit,
  onCancel,
  resetOnSubmit = false,
}: MemoFormProps) {
  const [content, setContent] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const contentId = useId();

  const canSubmit = content.trim().length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content);
      if (resetOnSubmit) setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <Label htmlFor={contentId}>メモ</Label>
        <Textarea
          id={contentId}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="付箋に書きたいことを..."
          rows={4}
          maxLength={MEMO_CONTENT_MAX}
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
