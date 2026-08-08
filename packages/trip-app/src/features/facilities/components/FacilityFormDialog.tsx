import { Dialog } from "@/components/ui/dialog";
import type { Facility } from "@/types/entities";
import { FacilityForm, type FacilityFormValues } from "./FacilityForm";

interface FacilityFormDialogProps {
  tripId: string;
  isOpen: boolean;
  editing: Facility | null;
  isSubmitting: boolean;
  onSubmit: (values: FacilityFormValues) => void;
  onClose: () => void;
}

export function FacilityFormDialog({
  tripId,
  isOpen,
  editing,
  isSubmitting,
  onSubmit,
  onClose,
}: FacilityFormDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} title={editing ? "施設を編集" : "施設を追加"}>
      <FacilityForm
        tripId={tripId}
        initial={editing ?? undefined}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
