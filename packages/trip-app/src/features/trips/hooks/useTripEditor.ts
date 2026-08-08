/**
 * src/features/trips/hooks/useTripEditor.ts
 *
 * Encapsulates the edit/delete state and mutations for a trip,
 * keeping the trip detail page and its header presentational.
 */

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteTrip, useUpdateTrip } from "./useTripMutations";

export interface TripEditValues {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
}

const EMPTY: TripEditValues = { title: "", location: "", startDate: "", endDate: "" };

export function useTripEditor(tripId: string) {
  const navigate = useNavigate();
  const updateTripMutation = useUpdateTrip(tripId);
  const deleteTripMutation = useDeleteTrip();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TripEditValues>(EMPTY);

  const startEdit = (values: TripEditValues) => {
    setEditData(values);
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const setField = (key: keyof TripEditValues, value: string) =>
    setEditData((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    updateTripMutation.mutate(editData, {
      onSuccess: () => {
        toast.success("旅行を更新しました");
        setIsEditing(false);
      },
      onError: () => toast.error("旅行の更新に失敗しました"),
    });
  };

  const remove = () => {
    if (!window.confirm("この旅行を削除してもよろしいですか？")) {
      return;
    }
    deleteTripMutation.mutate(tripId, {
      onSuccess: () => {
        toast.success("旅行を削除しました");
        navigate({ to: "/trips" });
      },
      onError: () => toast.error("旅行の削除に失敗しました"),
    });
  };

  return {
    isEditing,
    editData,
    setField,
    startEdit,
    cancelEdit,
    save,
    remove,
    isSaving: updateTripMutation.isPending,
    isDeleting: deleteTripMutation.isPending,
  };
}
