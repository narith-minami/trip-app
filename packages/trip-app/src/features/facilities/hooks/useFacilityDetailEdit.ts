/**
 * src/features/facilities/hooks/useFacilityDetailEdit.ts
 *
 * Edit/delete state and handlers for the facility detail page.
 */

import { useState } from "react";
import { toast } from "sonner";
import type { Facility } from "@/types/entities";
import type { FacilityFormValues } from "../components/FacilityForm";
import { toFacilityPayload } from "../lib/toFacilityPayload";
import { useFacilityMutations } from "./useFacilityMutations";

export function useFacilityDetailEdit(tripId: string, facility: Facility, onDeleted: () => void) {
  const { update, remove } = useFacilityMutations(tripId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleSubmit = (values: FacilityFormValues) => {
    update.mutate(
      { facilityId: facility.id, data: toFacilityPayload(values) },
      {
        onSuccess: () => {
          toast.success("施設を更新しました");
          setIsEditOpen(false);
        },
        onError: () => toast.error("施設の保存に失敗しました"),
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm("この施設を削除しますか？")) return;
    remove.mutate(facility.id, {
      onSuccess: () => {
        toast.success("施設を削除しました");
        onDeleted();
      },
      onError: () => toast.error("施設の削除に失敗しました"),
    });
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
