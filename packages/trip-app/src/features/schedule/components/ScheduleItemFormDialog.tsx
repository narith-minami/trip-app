import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
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

function LoadingOverlay({ isDeleting }: { isDeleting: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-coral"></div>
        <div className="text-sm font-medium text-ink-muted">
          {isDeleting ? "削除中..." : "保存中..."}
        </div>
      </div>
    </div>
  );
}

interface FormContentProps {
  isAdding: boolean;
  editing: ScheduleItem | null;
  facilities: Facility[];
  defaultDate: string;
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  onClose: () => void;
  onDelete: (item: ScheduleItem) => void;
}

function FormContent({
  isAdding,
  editing,
  facilities,
  defaultDate,
  isSubmitting,
  isDeleting,
  onSubmit,
  onClose,
  onDelete,
}: FormContentProps) {
  if (isAdding) {
    return (
      <ScheduleAddForm
        facilities={facilities}
        defaultDate={defaultDate}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    );
  }

  return (
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
  );
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
  const isLoading = isSubmitting || isDeleting;

  return (
    <Dialog open={isOpen} onClose={onClose} title={dialogTitle} fullscreen={isAdding}>
      <div className={cn("relative", isLoading && "pointer-events-none opacity-50")}>
        <FormContent
          isAdding={isAdding}
          editing={editing}
          facilities={facilities}
          defaultDate={defaultDate}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onSubmit={onSubmit}
          onClose={onClose}
          onDelete={onDelete}
        />
        {isLoading && <LoadingOverlay isDeleting={isDeleting} />}
      </div>
    </Dialog>
  );
}
