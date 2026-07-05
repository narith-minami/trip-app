/**
 * src/features/schedule/hooks/useScheduleSection.ts
 *
 * Wires schedule data, mutations and dialog state for the
 * trip detail "Schedule" tab, keeping the section component presentational.
 */

import type { ScheduleItem } from "@/types/entities";
import { useState } from "react";
import { toast } from "sonner";
import type { ScheduleFormValues } from "../components/ScheduleItemForm";
import { groupByDate, useScheduleItems } from "./useScheduleItems";
import { useScheduleMutations } from "./useScheduleMutations";

function toPayload(values: ScheduleFormValues) {
  return {
    date: values.date,
    // Use null (not undefined) so cleared fields are persisted as empty,
    // since the server PUT handler skips undefined values.
    startTime: values.startTime || null,
    endTime: values.endTime || null,
    title: values.title,
    eventType: values.eventType || null,
    placeName: values.placeName || null,
    placeUrl: values.placeUrl || null,
    memo: values.memo || null,
  };
}

export function useScheduleSection(tripId: string) {
  const { data: items, isLoading, error } = useScheduleItems(tripId);
  const { create, update, remove, reorder } = useScheduleMutations(tripId);
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

  const close = () => setIsOpen(false);

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

  const handleReorder = async (reorderedItems: Array<{ id: string; orderIndex: number }>) => {
    try {
      await reorder.mutateAsync(reorderedItems);
    } catch {
      toast.error("並び替えに失敗しました");
    }
  };

  return {
    items,
    isLoading,
    error,
    editing,
    isOpen,
    openCreate,
    openEdit,
    close,
    handleSubmit,
    handleDelete,
    handleReorder,
    isSubmitting: create.isPending || update.isPending,
    groupsMap: groupByDate(items ?? []),
  };
}
