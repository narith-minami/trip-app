/**
 * src/features/schedule/hooks/useScheduleSection.ts
 *
 * Wires schedule data, mutations and dialog state for the
 * trip detail "Schedule" tab, keeping the section component presentational.
 */

import { useState } from "react";
import { toast } from "sonner";
import type { ScheduleItem } from "@/types/entities";
import type { ScheduleFormValues } from "../components/ScheduleItemForm";
import { groupByDate, useScheduleItems } from "./useScheduleItems";
import { useScheduleMutations } from "./useScheduleMutations";

function toPayload(values: ScheduleFormValues) {
  return {
    date: values.date,
    startTime: values.startTime || null,
    endTime: values.endTime || null,
    title: values.title,
    eventType: values.eventType || null,
    placeName: values.placeName || null,
    placeUrl: values.placeUrl || null,
    memo: values.memo || null,
  };
}

function makeHandleSubmit(
  editing: ScheduleItem | null,
  create: ReturnType<typeof useScheduleMutations>["create"],
  update: ReturnType<typeof useScheduleMutations>["update"],
  setIsOpen: (v: boolean) => void
) {
  return async (values: ScheduleFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync({ itemId: editing.id, data: toPayload(values) as never });
        toast.success("Schedule item updated");
      } else {
        await create.mutateAsync(toPayload(values) as never);
        toast.success("Schedule item added");
      }
      setIsOpen(false);
    } catch {
      toast.error("Failed to save schedule item");
    }
  };
}

function makeHandleDelete(remove: ReturnType<typeof useScheduleMutations>["remove"]) {
  return async (item: ScheduleItem) => {
    if (!window.confirm("Delete this schedule item?")) return;
    try {
      await remove.mutateAsync(item.id);
      toast.success("Schedule item deleted");
    } catch {
      toast.error("Failed to delete schedule item");
    }
  };
}

function makeHandleReorder(reorder: ReturnType<typeof useScheduleMutations>["reorder"]) {
  return async (reordered: Array<{ id: string; orderIndex: number }>) => {
    try {
      await reorder.mutateAsync(reordered as never);
    } catch {
      toast.error("並び替えに失敗しました");
    }
  };
}

function makeHandleUploadImage(
  uploadImage: ReturnType<typeof useScheduleMutations>["uploadImage"]
) {
  return async (itemId: string, file: File) => {
    try {
      await uploadImage.mutateAsync({ itemId, file });
      toast.success("写真をアップロードしました");
    } catch {
      toast.error("写真のアップロードに失敗しました");
    }
  };
}

function makeHandleDeleteImage(
  deleteImage: ReturnType<typeof useScheduleMutations>["deleteImage"]
) {
  return async (itemId: string, imageId: string) => {
    if (!window.confirm("写真を削除しますか？")) return;
    try {
      await deleteImage.mutateAsync({ itemId, imageId });
      toast.success("写真を削除しました");
    } catch {
      toast.error("写真の削除に失敗しました");
    }
  };
}

function makeHandleCopy(
  copy: ReturnType<typeof useScheduleMutations>["copy"],
  setCopyOpen: (v: boolean) => void
) {
  return async (targetDate: string, itemIds: string[], onSuccess: (d: string) => void) => {
    try {
      await copy.mutateAsync({ targetDate, itemIds } as never);
      toast.success("予定をコピーしました");
      setCopyOpen(false);
      onSuccess(targetDate);
    } catch {
      toast.error("予定のコピーに失敗しました");
    }
  };
}

export function useScheduleSection(tripId: string) {
  const { data: items, isLoading, error } = useScheduleItems(tripId);
  const m = useScheduleMutations(tripId);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };
  const openEdit = (item: ScheduleItem) => {
    setEditing(item);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return {
    isLoading,
    error,
    editing,
    isOpen,
    openCreate,
    openEdit,
    close,
    handleSubmit: makeHandleSubmit(editing, m.create, m.update, setIsOpen),
    handleDelete: makeHandleDelete(m.remove),
    handleReorder: makeHandleReorder(m.reorder),
    handleUploadImage: makeHandleUploadImage(m.uploadImage),
    handleDeleteImage: makeHandleDeleteImage(m.deleteImage),
    isSubmitting: m.create.isPending || m.update.isPending,
    groupsMap: groupByDate(items ?? []),
    copyOpen,
    setCopyOpen,
    handleCopy: makeHandleCopy(m.copy, setCopyOpen),
    copyIsPending: m.copy.isPending,
  };
}
