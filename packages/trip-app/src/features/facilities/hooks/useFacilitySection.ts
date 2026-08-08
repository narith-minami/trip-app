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
import { useFacilities } from "./useFacilities";
import { useFacilityMutations } from "./useFacilityMutations";

function toPayload(values: FacilityFormValues) {
  return {
    category: values.category,
    name: values.name,
    address: values.address || null,
    phone: values.phone || null,
    businessHours: values.businessHours || null,
    url: values.url || null,
    memo: values.memo || null,
  };
}

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

  const handleSubmit = async (values: FacilityFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync({ facilityId: editing.id, data: toPayload(values) });
        toast.success("施設を更新しました");
      } else {
        await create.mutateAsync(toPayload(values));
        toast.success("施設を追加しました");
      }
      setIsOpen(false);
    } catch {
      toast.error("施設の保存に失敗しました");
    }
  };

  const handleDelete = async (facility: Facility) => {
    if (!window.confirm("この施設を削除しますか？")) return;
    try {
      await remove.mutateAsync(facility.id);
      toast.success("施設を削除しました");
    } catch {
      toast.error("施設の削除に失敗しました");
    }
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
