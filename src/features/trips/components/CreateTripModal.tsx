/**
 * src/features/trips/components/CreateTripModal.tsx
 *
 * Modal form for creating a new trip.
 */

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useCreateTrip } from "@/features/trips/hooks/useTripMutations";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

type TripFormData = typeof EMPTY_FORM;
type SetTripField = (key: keyof TripFormData, value: string) => void;

export interface CreateTripModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateTripFields({ formData, set }: { formData: TripFormData; set: SetTripField }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Trip Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g., Summer Vacation"
        />
      </div>
      <div>
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g., Paris, France"
        />
      </div>
      <div>
        <Label>Start Date *</Label>
        <Input
          type="date"
          value={formData.startDate}
          onChange={(e) => set("startDate", e.target.value)}
        />
      </div>
      <div>
        <Label>End Date *</Label>
        <Input
          type="date"
          value={formData.endDate}
          onChange={(e) => set("endDate", e.target.value)}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          rows={3}
          value={formData.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Trip details..."
        />
      </div>
    </div>
  );
}

export function CreateTripModal({ open, onClose }: CreateTripModalProps) {
  const [formData, setFormData] = useState<TripFormData>(EMPTY_FORM);
  const createTripMutation = useCreateTrip();

  const set: SetTripField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createTripMutation.mutateAsync(formData);
      toast.success("Trip created successfully");
      setFormData(EMPTY_FORM);
      onClose();
    } catch {
      toast.error("Failed to create trip");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create New Trip">
      <form onSubmit={handleCreate}>
        <CreateTripFields formData={formData} set={set} />
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={createTripMutation.isPending}>
            {createTripMutation.isPending ? "Creating..." : "Create Trip"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
