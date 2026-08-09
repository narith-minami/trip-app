import { Dialog } from "@/components/ui/dialog";
import type { Facility, ScheduleItem } from "@/types/entities";
import { ScheduleAddForm } from "./ScheduleAddForm";
import { type ScheduleFormValues, ScheduleItemForm } from "./ScheduleItemForm";

interface ScheduleItemFormDialogProps {
  facilities: Facility[];
  isOpen: boolean;
  editing: ScheduleItem | null;
  defaultDate: string;
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  onClose: () => void;
  onDelete: (item: ScheduleItem) => void;
}

export function ScheduleItemFormDialog({
  facilities,
  isOpen,
  editing,
  defaultDate,
  isSubmitting,
  isDeleting,
  onSubmit,
  onClose,
  onDelete,
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

  const isAdding = !editing;
  const dialogTitle = isAdding ? "スケジュール追加" : title;

  return (
    <Dialog open={isOpen} onClose={onClose} title={dialogTitle} fullscreen={isAdding}>
      {isAdding ? (
        <ScheduleAddForm
          facilities={facilities}
          defaultDate={defaultDate}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      ) : (
        <ScheduleItemForm
          facilities={facilities}
          initial={editing ?? undefined}
          defaultDate={defaultDate}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onSubmit={onSubmit}
          onCancel={onClose}
          onDelete={editing ? () => onDelete(editing) : undefined}
        />
      )}
    </Dialog>
  );
}
