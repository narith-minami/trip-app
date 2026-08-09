/**
 * src/features/memo/components/MemoComposer.tsx
 *
 * Create form for a new memo (sticky note), shown at the top of the memo tab.
 */

import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useMemoMutations } from "@/features/memo/hooks/useMemoMutations";
import { MemoForm } from "./MemoForm";

export interface MemoComposerProps {
  tripId: string;
}

export function MemoComposer({ tripId }: MemoComposerProps) {
  const { create } = useMemoMutations(tripId);

  const handleSubmit = async (content: string) => {
    try {
      await create.mutateAsync(content);
      toast.success("メモを追加しました");
    } catch {
      toast.error("メモの追加に失敗しました");
      throw new Error("create failed"); // keep form value for retry
    }
  };

  return (
    <Card className="p-4">
      <h2 className="mb-3 font-display text-lg font-semibold text-navy">新しいメモ</h2>
      <MemoForm submitLabel="追加" onSubmit={handleSubmit} resetOnSubmit />
    </Card>
  );
}
