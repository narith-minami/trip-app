/**
 * src/features/memo/components/MemoSection.tsx
 *
 * Container for the trip detail "Memo" tab.
 */

import { toast } from "sonner";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
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

  if (isLoading) return <LoadingSpinner label="メモを読み込み中..." />;
  if (error) return <p className="text-red-600">メモの読み込みに失敗しました。</p>;

  return (
    <MemoEditor
      content={memo?.content ?? ""}
      isSaving={updateMutation.isPending}
      onSave={handleSave}
    />
  );
}
