/**
 * src/features/memo/components/MemoSection.tsx
 *
 * Container for the trip detail "Memo" tab.
 */

import { toast } from "sonner";
import { QueryBoundary } from "@/components/feedback/QueryBoundary";
import { useTripMemo } from "@/features/memo/hooks/useMemo";
import { useMemoUpdateMutation } from "@/features/memo/hooks/useMemoUpdateMutation";
import { MemoEditor } from "./MemoEditor";

export interface MemoSectionProps {
  tripId: string;
}

export function MemoSection({ tripId }: MemoSectionProps) {
  const { data: memo, isLoading, error } = useTripMemo(tripId);
  const updateMutation = useMemoUpdateMutation(tripId);

  const handleSave = (content: string) => {
    updateMutation.mutate(content, {
      onSuccess: () => toast.success("メモを保存しました"),
      onError: () => toast.error("メモの保存に失敗しました"),
    });
  };

  return (
    <QueryBoundary
      isLoading={isLoading}
      error={error}
      loadingLabel="メモを読み込み中..."
      errorMessage="メモの読み込みに失敗しました。"
    >
      <MemoEditor
        content={memo?.content ?? ""}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
      />
    </QueryBoundary>
  );
}
