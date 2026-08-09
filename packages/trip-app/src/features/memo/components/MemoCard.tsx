/**
 * src/features/memo/components/MemoCard.tsx
 *
 * Displays a single memo (sticky note): body, creator + created date, and
 * updater + last-updated date (when it differs from creation). Any trip
 * member can edit; only the creator can delete.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMemoMutations } from "@/features/memo/hooks/useMemoMutations";
import type { TripMemo } from "@/types/entities";
import { MemoForm } from "./MemoForm";

interface MemoCardProps {
  tripId: string;
  memo: TripMemo;
  isCreator: boolean;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MemoFooter({ memo }: { memo: TripMemo }) {
  const wasUpdated = memo.updatedAt !== memo.createdAt || memo.updatedBy !== memo.createdBy;

  return (
    <div className="flex flex-col gap-1.5 border-t border-cream-dark pt-3 text-sm text-ink-muted">
      <div className="flex items-center gap-2">
        <Avatar name={memo.creator?.name ?? "?"} image={memo.creator?.image} className="h-7 w-7" />
        <span>{memo.creator?.name ?? "不明"}が作成</span>
        <span className="text-xs text-ink-light">{formatDate(memo.createdAt)}</span>
      </div>
      {wasUpdated && (
        <div className="flex items-center gap-2 pl-9">
          <span>{memo.updater?.name ?? "不明"}が更新</span>
          <span className="text-xs text-ink-light">{formatDate(memo.updatedAt)}</span>
        </div>
      )}
    </div>
  );
}

export function MemoCard({ tripId, memo, isCreator }: MemoCardProps) {
  const { update, remove } = useMemoMutations(tripId);
  const [editing, setEditing] = useState(false);

  const handleUpdate = async (content: string) => {
    try {
      await update.mutateAsync({ memoId: memo.id, content });
      toast.success("メモを更新しました");
      setEditing(false);
    } catch {
      toast.error("メモの更新に失敗しました");
      throw new Error("update failed");
    }
  };

  const handleDelete = () => {
    if (!window.confirm("このメモを削除しますか？")) return;
    remove.mutate(memo.id, {
      onSuccess: () => toast.success("メモを削除しました"),
      onError: () => toast.error("メモの削除に失敗しました"),
    });
  };

  if (editing) {
    return (
      <Card className="p-4">
        <MemoForm
          initial={memo.content}
          submitLabel="更新"
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <p className="whitespace-pre-wrap break-words text-ink">{memo.content}</p>
      <MemoFooter memo={memo} />
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          編集
        </Button>
        {isCreator && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={remove.isPending}
            className="text-red-600 hover:text-red-700"
          >
            削除
          </Button>
        )}
      </div>
    </Card>
  );
}
