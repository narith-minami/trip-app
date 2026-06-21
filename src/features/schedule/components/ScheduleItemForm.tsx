/**
 * src/features/schedule/components/ScheduleItemForm.tsx
 *
 * Controlled form for creating or editing a schedule item.
 */

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { ScheduleItem } from "@/types/entities";
import { useState } from "react";
import type { FormEvent } from "react";

export interface ScheduleFormValues {
  date: string;
  startTime: string;
  title: string;
  placeName: string;
  placeUrl: string;
  memo: string;
}

export interface ScheduleItemFormProps {
  initial?: ScheduleItem;
  defaultDate?: string;
  isSubmitting?: boolean;
  onSubmit: (values: ScheduleFormValues) => void;
  onCancel: () => void;
}

function toValues(item?: ScheduleItem, defaultDate?: string): ScheduleFormValues {
  return {
    date: item?.date ?? defaultDate ?? "",
    startTime: item?.startTime ?? "",
    title: item?.title ?? "",
    placeName: item?.placeName ?? "",
    placeUrl: item?.placeUrl ?? "",
    memo: item?.memo ?? "",
  };
}

export function ScheduleItemForm({
  initial,
  defaultDate,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ScheduleItemFormProps) {
  const [values, setValues] = useState<ScheduleFormValues>(() => toValues(initial, defaultDate));

  const set = (key: keyof ScheduleFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Date *</Label>
          <Input
            type="date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Start time</Label>
          <Input
            type="time"
            value={values.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Title *</Label>
        <Input
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g., Check-in at hotel"
          required
        />
      </div>

      <div>
        <Label>Place name</Label>
        <Input
          value={values.placeName}
          onChange={(e) => set("placeName", e.target.value)}
          placeholder="e.g., Grand Hotel"
        />
      </div>

      <div>
        <Label>Place URL</Label>
        <Input
          type="url"
          value={values.placeUrl}
          onChange={(e) => set("placeUrl", e.target.value)}
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div>
        <Label>Memo</Label>
        <Textarea
          rows={3}
          value={values.memo}
          onChange={(e) => set("memo", e.target.value)}
          placeholder="Notes..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
