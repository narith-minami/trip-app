/**
 * src/features/facilities/components/FacilityForm.tsx
 *
 * Controlled form for creating or editing a facility.
 */

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { FACILITY_TYPE_LIST, type FacilityCategory } from "@/lib/facilityTypes";
import type { Facility } from "@/types/entities";

export interface FacilityFormValues {
  category: FacilityCategory;
  name: string;
  address: string;
  phone: string;
  businessHours: string;
  url: string;
  memo: string;
}

export interface FacilityFormProps {
  initial?: Facility;
  isSubmitting?: boolean;
  onSubmit: (values: FacilityFormValues) => void;
  onCancel: () => void;
}

function toValues(item?: Facility): FacilityFormValues {
  return {
    category: (item?.category as FacilityCategory | undefined) ?? "hotel",
    name: item?.name ?? "",
    address: item?.address ?? "",
    phone: item?.phone ?? "",
    businessHours: item?.businessHours ?? "",
    url: item?.url ?? "",
    memo: item?.memo ?? "",
  };
}

type SetField = (key: keyof FacilityFormValues, value: string) => void;

interface FieldsProps {
  values: FacilityFormValues;
  set: SetField;
}

function CategorySelector({ values, set }: FieldsProps) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-1.5 text-sm font-medium text-ink">カテゴリ *</legend>
      <div className="flex flex-wrap gap-2">
        {FACILITY_TYPE_LIST.map(({ key, label, icon: Icon, color }) => {
          const selected = values.category === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => set("category", key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                selected
                  ? "border-transparent text-white"
                  : "border-cream-dark bg-white text-ink-muted hover:border-ink-muted hover:text-ink"
              )}
              style={selected ? { backgroundColor: color, borderColor: color } : undefined}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FacilityForm({
  initial,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: FacilityFormProps) {
  const [values, setValues] = useState<FacilityFormValues>(() => toValues(initial));

  const set: SetField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>施設名 *</Label>
        <Input
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="例：グランドホテル東京"
          required
        />
      </div>

      <CategorySelector values={values} set={set} />

      <div>
        <Label>住所</Label>
        <Input
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="例：東京都港区海岸1-1-1"
        />
      </div>

      <div>
        <Label>電話番号</Label>
        <Input
          type="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="例：03-1234-5678"
        />
      </div>

      <div>
        <Label>営業時間</Label>
        <Input
          value={values.businessHours}
          onChange={(e) => set("businessHours", e.target.value)}
          placeholder="例：10:00-19:00"
        />
      </div>

      <div>
        <Label>URL</Label>
        <Input
          type="url"
          value={values.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label>メモ</Label>
        <Textarea
          rows={3}
          value={values.memo}
          onChange={(e) => set("memo", e.target.value)}
          placeholder="メモ..."
        />
      </div>

      <div className="sticky bottom-0 -mx-6 flex gap-3 bg-white px-6 pt-3 pb-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
