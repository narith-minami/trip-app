/**
 * src/features/facilities/hooks/useFacilitySection.ts
 *
 * Wires facility data, mutations and dialog state for the
 * trip detail "施設" tab, keeping the section component presentational.
 */

import { useState } from "react";
import { toast } from "sonner";
import type { Facility } from "@/types/entities";
import type { FacilityFormValues } from "../components/FacilityForm";
import { toFacilityPayload } from "../lib/toFacilityPayload";
import { useFacilities } from "./useFacilities";
import { useFacilityMutations } from "./useFacilityMutations";

export function useFacilitySection(tripId: string) {
  const { data: facilities, isLoading, error } = useFacilities(tripId);
  const { create, update, remove } = useFacilityMutations(tripId);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };
  const openEdit = (facility: Facility) => {
    setEditing(facility);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const handleSubmit = (values: FacilityFormValues) => {
    const data = toFacilityPayload(values);
    const onSuccess = () => {
      toast.success(editing ? "施設を更新しました" : "施設を追加しました");
      setIsOpen(false);
    };
    const onError = () => toast.error("施設の保存に失敗しました");
    if (editing) {
      update.mutate({ facilityId: editing.id, data }, { onSuccess, onError });
    } else {
      create.mutate(data, { onSuccess, onError });
    }
  };

  const handleDelete = (facility: Facility) => {
    if (!window.confirm("この施設を削除しますか？")) return;
    remove.mutate(facility.id, {
      onSuccess: () => toast.success("施設を削除しました"),
      onError: () => toast.error("施設の削除に失敗しました"),
    });
  };

  return {
    facilities: facilities ?? [],
    isLoading,
    error,
    editing,
    isOpen,
    openCreate,
    openEdit,
    close,
    handleSubmit,
    handleDelete,
    isSubmitting: create.isPending || update.isPending,
  };
}
