import { useState } from "react";
import { toast } from "sonner";
import { useScheduleItems } from "@/features/schedule/hooks/useScheduleItems";
import { useScheduleMutations } from "@/features/schedule/hooks/useScheduleMutations";
import { type PendingChange, timeToMinutes } from "./calendarLayout";

interface UseScheduleSaveOptions {
  tripId: string;
  currentDate: string;
  deletedIds: Set<string>;
  pendingChanges: Map<string, PendingChange>;
  onBack: () => void;
}

export function useScheduleSave({
  tripId,
  currentDate,
  deletedIds,
  pendingChanges,
  onBack,
}: UseScheduleSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const { data: items } = useScheduleItems(tripId);
  const { update, remove, reorder } = useScheduleMutations(tripId);

  const allDateItems = (items ?? []).filter((i) => i.date === currentDate);

  async function handleSave() {
    setIsSaving(true);
    try {
      await Promise.all([...deletedIds].map((id) => remove.mutateAsync(id)));

      const updateEntries = [...pendingChanges.entries()].filter(([id]) => !deletedIds.has(id));
      await Promise.all(
        updateEntries.map(([id, data]) => update.mutateAsync({ itemId: id, data }))
      );

      const survivors = allDateItems
        .filter((i) => !deletedIds.has(i.id))
        .map((i) => {
          const pending = pendingChanges.get(i.id);
          return pending ? { ...i, startTime: pending.startTime } : i;
        })
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      if (survivors.length > 1) {
        await reorder.mutateAsync(survivors.map((item, idx) => ({ id: item.id, orderIndex: idx })));
      }

      onBack();
    } catch {
      toast.error("保存に失敗しました");
      setIsSaving(false);
    }
  }

  return { isSaving, handleSave, allDateItems };
}
