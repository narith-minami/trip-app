import { Dialog } from "@/components/ui/dialog";
import type { Facility, ScheduleItem } from "@/types/entities";
import { type ScheduleFormValues, ScheduleItemForm } from "./ScheduleItemForm";

interface ScheduleItemFormDialogProps {
  facilities: Facility[];
  isOpen: boolean;
  editing: ScheduleItem | null;
  defaultDate: string;
  isSubmitting: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  onClose: () => void;
}

export function ScheduleItemFormDialog({
  facilities,
  isOpen,
  editing,
  defaultDate,
  isSubmitting,
  onSubmit,
  onClose,
}: ScheduleItemFormDialogProps) {
  const title = editing ? (
    <span className="flex items-center gap-2">
      スケジュール編集
      {editing.isTentative === 1 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-light bg-cream px-2 py-0.5 text-xs font-medium text-ink-muted">
          仮予定
        </span>
      )}
    </span>
  ) : (
    "スケジュール追加"
  );

  return (
    <Dialog open={isOpen} onClose={onClose} title={title}>
      <ScheduleItemForm
        facilities={facilities}
        initial={editing ?? undefined}
        defaultDate={defaultDate}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
