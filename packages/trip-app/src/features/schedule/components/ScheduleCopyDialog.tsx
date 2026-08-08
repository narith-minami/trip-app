/**
 * src/features/schedule/components/ScheduleCopyDialog.tsx
 *
 * 3-step dialog for copying schedule items from one date to another.
 */

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { ScheduleItem } from "@/types/entities";
import { CopyStepConfirm, CopyStepItems, CopyStepTargetDate } from "./copySteps";

export interface ScheduleCopyDialogProps {
  sourceDate: string;
  items: ScheduleItem[];
  dates: string[];
  onCopy: (targetDate: string, itemIds: string[]) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export function ScheduleCopyDialog({
  sourceDate,
  items,
  dates,
  onCopy,
  onClose,
  isSubmitting = false,
}: ScheduleCopyDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(items.map((i) => i.id)));
  const [targetDate, setTargetDate] = useState("");
  const candidateDates = dates.filter((d) => d !== sourceDate);
  const allSelected = selectedIds.size === items.length;
  const toggleItem = (id: string) =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const titles = ["コピーする予定を選択", "コピー先の日付を選択", "コピーの確認"] as const;

  return (
    <Dialog open onClose={onClose} title={titles[step - 1]} className="max-w-lg">
      {step === 1 && (
        <CopyStepItems
          sourceDate={sourceDate}
          items={items}
          selectedIds={selectedIds}
          allSelected={allSelected}
          onToggleItem={toggleItem}
          onToggleAll={toggleAll}
          onNext={() => setStep(2)}
          onClose={onClose}
        />
      )}
      {step === 2 && (
        <CopyStepTargetDate
          candidateDates={candidateDates}
          targetDate={targetDate}
          onSelect={setTargetDate}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <CopyStepConfirm
          sourceDate={sourceDate}
          targetDate={targetDate}
          selectedItems={selectedItems}
          isSubmitting={isSubmitting}
          onConfirm={() => onCopy(targetDate, [...selectedIds])}
          onBack={() => setStep(2)}
        />
      )}
    </Dialog>
  );
}
