import { Dialog } from "@/components/ui/dialog";
import type { Facility } from "@/types/entities";
import { FacilityForm, type FacilityFormValues } from "./FacilityForm";

interface FacilityFormDialogProps {
  isOpen: boolean;
  editing: Facility | null;
  isSubmitting: boolean;
  onSubmit: (values: FacilityFormValues) => void;
  onClose: () => void;
}

export function FacilityFormDialog({
  isOpen,
  editing,
  isSubmitting,
  onSubmit,
  onClose,
}: FacilityFormDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} title={editing ? "施設を編集" : "施設を追加"}>
      <FacilityForm
        initial={editing ?? undefined}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
