/**
 * src/features/trips/components/CreateTripModal.tsx
 *
 * Modal form for creating a new trip.
 */

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useCreateTrip } from "@/features/trips/hooks/useTripMutations";

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
        <Label>旅行タイトル *</Label>
        <Input
          value={formData.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="例：夏休みの旅行"
        />
      </div>
      <div>
        <Label>場所</Label>
        <Input
          value={formData.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="例：東京、日本"
        />
      </div>
      <div>
        <Label>出発日 *</Label>
        <Input
          type="date"
          value={formData.startDate}
          onChange={(e) => set("startDate", e.target.value)}
        />
      </div>
      <div>
        <Label>帰着日 *</Label>
        <Input
          type="date"
          value={formData.endDate}
          onChange={(e) => set("endDate", e.target.value)}
        />
      </div>
      <div>
        <Label>説明</Label>
        <Textarea
          rows={3}
          value={formData.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="旅行の詳細..."
        />
      </div>
    </div>
  );
}

export function CreateTripModal({ open, onClose }: CreateTripModalProps) {
  const [formData, setFormData] = useState<TripFormData>(EMPTY_FORM);
  const createTripMutation = useCreateTrip();

  const set: SetTripField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("必須項目を入力してください");
      return;
    }

    createTripMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("旅行を作成しました");
        setFormData(EMPTY_FORM);
        onClose();
      },
      onError: () => toast.error("旅行の作成に失敗しました"),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="新しい旅行を作成">
      <form onSubmit={handleCreate}>
        <CreateTripFields formData={formData} set={set} />
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" className="flex-1" disabled={createTripMutation.isPending}>
            {createTripMutation.isPending ? "作成中..." : "旅行を作成"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
