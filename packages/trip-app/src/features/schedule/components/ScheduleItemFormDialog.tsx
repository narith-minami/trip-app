import { Dialog } from "@/components/ui/dialog";
import type { ScheduleItem } from "@/types/entities";
import { type ScheduleFormValues, ScheduleItemForm } from "./ScheduleItemForm";

interface ScheduleItemFormDialogProps {
  isOpen: boolean;
  editing: ScheduleItem | null;
  defaultDate: string;
  isSubmitting: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  onClose: () => void;
}

export function ScheduleItemFormDialog({
  isOpen,
  editing,
  defaultDate,
  isSubmitting,
  onSubmit,
  onClose,
}: ScheduleItemFormDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={editing ? "スケジュール編集" : "スケジュール追加"}
    >
      <ScheduleItemForm
        initial={editing ?? undefined}
        defaultDate={defaultDate}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
