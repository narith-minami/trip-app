/**
 * src/features/schedule/components/ScheduleSection.tsx
 *
 * Container that wires schedule data, mutations and UI together
 * for the trip detail "Schedule" tab.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useScheduleItems, groupByDate } from "@/features/schedule/hooks/useScheduleItems";
import { useScheduleMutations } from "@/features/schedule/hooks/useScheduleMutations";
import type { ScheduleItem } from "@/types/entities";
import {
  ScheduleItemForm,
  type ScheduleFormValues,
} from "./ScheduleItemForm";
import { ScheduleTimeline } from "./ScheduleTimeline";

export interface ScheduleSectionProps {
  tripId: string;
  canEdit?: boolean;
  defaultDate?: string;
}

function toPayload(values: ScheduleFormValues) {
  return {
    date: values.date,
    // Use null (not undefined) so cleared fields are persisted as empty,
    // since the server PUT handler skips undefined values.
    startTime: values.startTime || null,
    title: values.title,
    placeName: values.placeName || null,
    placeUrl: values.placeUrl || null,
    memo: values.memo || null,
  };
}

export function ScheduleSection({ tripId, canEdit = false, defaultDate }: ScheduleSectionProps) {
  const { data: items, isLoading, error } = useScheduleItems(tripId);
  const { create, update, remove } = useScheduleMutations(tripId);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (item: ScheduleItem) => {
    setEditing(item);
    setIsOpen(true);
  };

  const handleSubmit = async (values: ScheduleFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync({ itemId: editing.id, data: toPayload(values) });
        toast.success("Schedule item updated");
      } else {
        await create.mutateAsync(toPayload(values));
        toast.success("Schedule item added");
      }
      setIsOpen(false);
    } catch {
      toast.error("Failed to save schedule item");
    }
  };

  const handleDelete = async (item: ScheduleItem) => {
    if (!window.confirm("Delete this schedule item?")) return;
    try {
      await remove.mutateAsync(item.id);
      toast.success("Schedule item deleted");
    } catch {
      toast.error("Failed to delete schedule item");
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading schedule..." />;
  if (error) return <p className="text-red-600">Failed to load schedule.</p>;

  const groups = [...groupByDate(items ?? []).entries()];

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
        onClose={() => setIsOpen(false)}
        title={editing ? "Edit schedule item" : "Add schedule item"}
      >
        <ScheduleItemForm
          initial={editing ?? undefined}
          defaultDate={defaultDate}
          isSubmitting={create.isPending || update.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </Dialog>
    </div>
  );
}
