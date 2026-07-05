import { useState } from "react";
import { toast } from "sonner";
import { useScheduleMutations } from "@/features/schedule/hooks/useScheduleMutations";

export function useScheduleCopy(tripId: string) {
  const { copy } = useScheduleMutations(tripId);
  const [copyOpen, setCopyOpen] = useState(false);

  async function handleCopy(
    targetDate: string,
    itemIds: string[],
    onSuccess: (targetDate: string) => void
  ) {
    try {
      await copy.mutateAsync({ targetDate, itemIds });
      toast.success("予定をコピーしました");
      setCopyOpen(false);
      onSuccess(targetDate);
    } catch {
      toast.error("予定のコピーに失敗しました");
    }
  }

  return { copyOpen, setCopyOpen, handleCopy, copy };
}
