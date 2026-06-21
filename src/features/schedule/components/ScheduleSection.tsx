/**
 * src/features/schedule/components/ScheduleSection.tsx
 *
 * Container that wires schedule data, mutations and UI together
 * for the trip detail "Schedule" tab.
 */

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useScheduleSection } from "@/features/schedule/hooks/useScheduleSection";
import { ScheduleItemForm } from "./ScheduleItemForm";
import { ScheduleTimeline } from "./ScheduleTimeline";

export interface ScheduleSectionProps {
  tripId: string;
  canEdit?: boolean;
  defaultDate?: string;
}

export function ScheduleSection({ tripId, canEdit = false, defaultDate }: ScheduleSectionProps) {
  const {
    isLoading,
    error,
    editing,
    isOpen,
    openCreate,
    openEdit,
    close,
    handleSubmit,
    handleDelete,
    isSubmitting,
    groups,
  } = useScheduleSection(tripId);

  if (isLoading) return <LoadingSpinner label="Loading schedule..." />;
  if (error) return <p className="text-red-600">Failed to load schedule.</p>;

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={openCreate}>+ Add item</Button>
        </div>
      )}

      <ScheduleTimeline
        groups={groups}
        canEdit={canEdit}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Dialog
        open={isOpen}
        onClose={close}
        title={editing ? "Edit schedule item" : "Add schedule item"}
      >
        <ScheduleItemForm
          initial={editing ?? undefined}
          defaultDate={defaultDate}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </Dialog>
    </div>
  );
}
