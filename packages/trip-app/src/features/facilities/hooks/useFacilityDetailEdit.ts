/**
 * src/features/facilities/hooks/useFacilityDetailEdit.ts
 *
 * Edit/delete state and handlers for the facility detail page.
 */

import { useState } from "react";
import { toast } from "sonner";
import type { Facility } from "@/types/entities";
import type { FacilityFormValues } from "../components/FacilityForm";
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

export function useFacilityDetailEdit(tripId: string, facility: Facility, onDeleted: () => void) {
  const { update, remove } = useFacilityMutations(tripId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleSubmit = async (values: FacilityFormValues) => {
    try {
      await update.mutateAsync({ facilityId: facility.id, data: toPayload(values) });
      toast.success("施設を更新しました");
      setIsEditOpen(false);
    } catch {
      toast.error("施設の保存に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("この施設を削除しますか？")) return;
    try {
      await remove.mutateAsync(facility.id);
      toast.success("施設を削除しました");
      onDeleted();
    } catch {
      toast.error("施設の削除に失敗しました");
    }
  };

  return {
    isEditOpen,
    openEdit: () => setIsEditOpen(true),
    closeEdit: () => setIsEditOpen(false),
    handleSubmit,
    handleDelete,
    isSubmitting: update.isPending,
  };
}
