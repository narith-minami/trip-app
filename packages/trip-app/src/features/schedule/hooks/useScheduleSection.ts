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
    isTentative: values.isTentative,
    placeName: values.placeName || null,
    placeUrl: values.placeUrl || null,
    memo: values.memo || null,
    facilityId: values.facilityId || null,
  };
}

function makeHandleSubmit(
  editing: ScheduleItem | null,
  create: ReturnType<typeof useScheduleMutations>["create"],
  update: ReturnType<typeof useScheduleMutations>["update"],
  setIsOpen: (v: boolean) => void
) {
  return (values: ScheduleFormValues) => {
    const data = toPayload(values);
    const onSuccess = () => {
      toast.success(editing ? "予定を更新しました" : "予定を追加しました");
      setIsOpen(false);
    };
    const onError = () => toast.error("予定の保存に失敗しました");
    if (editing) {
      update.mutate({ itemId: editing.id, data }, { onSuccess, onError });
    } else {
      create.mutate(data, { onSuccess, onError });
    }
  };
}

function makeHandleDelete(
  remove: ReturnType<typeof useScheduleMutations>["remove"],
  editing: ScheduleItem | null,
  setIsOpen: (v: boolean) => void
) {
  return (item: ScheduleItem) => {
    if (!window.confirm("この予定を削除しますか？")) return;
    remove.mutate(item.id, {
      onSuccess: () => {
        toast.success("予定を削除しました");
        // Only close the dialog if it's still showing the item we just deleted —
        // guards against a stale success callback closing a dialog opened for
        // a different item in the meantime.
        if (editing?.id === item.id) setIsOpen(false);
      },
      onError: () => toast.error("予定の削除に失敗しました"),
    });
  };
}

function makeHandleReorder(reorder: ReturnType<typeof useScheduleMutations>["reorder"]) {
  return (reordered: Array<{ id: string; orderIndex: number }>) => {
    reorder.mutate(reordered, { onError: () => toast.error("並び替えに失敗しました") });
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
  return (targetDate: string, itemIds: string[], onSuccess: (d: string) => void) => {
    copy.mutate(
      { targetDate, itemIds },
      {
        onSuccess: () => {
          toast.success("予定をコピーしました");
          setCopyOpen(false);
          onSuccess(targetDate);
        },
        onError: () => toast.error("予定のコピーに失敗しました"),
      }
    );
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
    handleDelete: makeHandleDelete(m.remove, editing, setIsOpen),
    handleReorder: makeHandleReorder(m.reorder),
    handleUploadImage: makeHandleUploadImage(m.uploadImage),
    handleDeleteImage: makeHandleDeleteImage(m.deleteImage),
    isSubmitting: m.create.isPending || m.update.isPending,
    isDeleting: m.remove.isPending,
    groupsMap: groupByDate(items ?? []),
    copyOpen,
    setCopyOpen,
    handleCopy: makeHandleCopy(m.copy, setCopyOpen),
    copyIsPending: m.copy.isPending,
  };
}
