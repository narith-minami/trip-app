/**
 * src/features/schedule/components/ScheduleItemForm.tsx
 *
 * Controlled form for creating or editing a schedule item.
 */

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { EVENT_TYPE_LIST, type EventType } from "@/lib/eventTypes";
import type { ScheduleItem } from "@/types/entities";

export interface ScheduleFormValues {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  eventType: EventType | "";
  isTentative: boolean;
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
    endTime: item?.endTime ?? "",
    title: item?.title ?? "",
    eventType: (item?.eventType as EventType | undefined) ?? "",
    isTentative: item?.isTentative === 1,
    placeName: item?.placeName ?? "",
    placeUrl: item?.placeUrl ?? "",
    memo: item?.memo ?? "",
  };
}

type SetField = (key: keyof ScheduleFormValues, value: string | boolean) => void;

interface FieldsProps {
  values: ScheduleFormValues;
  set: SetField;
}

function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function EventTypeSelector({ values, set }: FieldsProps) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-1.5 text-sm font-medium text-ink">イベントタイプ</legend>
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPE_LIST.map(({ key, label, icon: Icon, color }) => {
          const selected = values.eventType === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => set("eventType", selected ? "" : key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
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

function ScheduleDateTitleFields({ values, set }: FieldsProps) {
  const handleStartTimeChange = (value: string) => {
    set("startTime", value);
    if (!values.endTime && value) {
      set("endTime", addOneHour(value));
    }
  };

  return (
    <>
      <div>
        <Label>日付 *</Label>
        <Input
          type="date"
          value={values.date}
          onChange={(e) => set("date", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>開始時刻</Label>
          <Input
            type="time"
            value={values.startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
          />
        </div>
        <div>
          <Label>終了時刻</Label>
          <Input
            type="time"
            value={values.endTime}
            min={values.startTime || undefined}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>タイトル *</Label>
        <Input
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="例：ホテルチェックイン"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={values.isTentative}
          onChange={(e) => set("isTentative", e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-cream-dark text-coral focus:ring-coral"
        />
        仮予定にする（まだ確定していません）
      </label>
    </>
  );
}

function SchedulePlaceFields({ values, set }: FieldsProps) {
  return (
    <>
      <div>
        <Label>場所名</Label>
        <Input
          value={values.placeName}
          onChange={(e) => set("placeName", e.target.value)}
          placeholder="例：グランドホテル"
        />
      </div>

      <div>
        <Label>場所のURL</Label>
        <Input
          type="url"
          value={values.placeUrl}
          onChange={(e) => set("placeUrl", e.target.value)}
          placeholder="https://maps.google.com/..."
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
    </>
  );
}

export function ScheduleItemForm({
  initial,
  defaultDate,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ScheduleItemFormProps) {
  const [values, setValues] = useState<ScheduleFormValues>(() => toValues(initial, defaultDate));

  const set: SetField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ScheduleDateTitleFields values={values} set={set} />
      <EventTypeSelector values={values} set={set} />
      <SchedulePlaceFields values={values} set={set} />

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
