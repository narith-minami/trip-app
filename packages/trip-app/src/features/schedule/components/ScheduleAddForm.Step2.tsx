import { ChevronLeft } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { Facility } from "@/types/entities";

interface BaseFieldsProps {
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  isTentative: boolean;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onTentativeChange: (value: boolean) => void;
}

function BaseFields({
  date,
  startTime,
  endTime,
  title,
  isTentative,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onTitleChange,
  onTentativeChange,
}: BaseFieldsProps) {
  return (
    <>
      <div>
        <Label>日付 *</Label>
        <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>開始時刻</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
          />
        </div>
        <div>
          <Label>終了時刻</Label>
          <Input
            type="time"
            value={endTime}
            min={startTime || undefined}
            onChange={(e) => onEndTimeChange(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>タイトル *</Label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="例：ホテルチェックイン"
          required
        />
      </div>

      <button
        type="button"
        aria-pressed={isTentative}
        onClick={() => onTentativeChange(!isTentative)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
          isTentative
            ? "border-dashed border-ink-light bg-cream text-ink-muted"
            : "border-cream-dark bg-white text-ink-muted hover:border-ink-muted hover:text-ink"
        )}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <title>仮予定</title>
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="flex-1 text-left">仮予定にする（まだ確定していません）</span>
      </button>
    </>
  );
}

interface PlaceFieldsProps {
  facilities: Facility[];
  placeName: string;
  placeUrl: string;
  memo: string;
  facilityId: string;
  onPlaceNameChange: (value: string) => void;
  onPlaceUrlChange: (value: string) => void;
  onMemoChange: (value: string) => void;
  onFacilityChange: (value: string) => void;
}

function PlaceFields({
  facilities,
  placeName,
  placeUrl,
  memo,
  facilityId,
  onPlaceNameChange,
  onPlaceUrlChange,
  onMemoChange,
  onFacilityChange,
}: PlaceFieldsProps) {
  return (
    <>
      <div>
        <Label>場所名</Label>
        <Input
          value={placeName}
          onChange={(e) => onPlaceNameChange(e.target.value)}
          placeholder="例：グランドホテル"
        />
      </div>

      <div>
        <Label>場所のURL</Label>
        <Input
          type="url"
          value={placeUrl}
          onChange={(e) => onPlaceUrlChange(e.target.value)}
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div>
        <Label htmlFor="schedule-facility">紐付ける施設</Label>
        <Select
          id="schedule-facility"
          value={facilityId}
          onChange={(e) => onFacilityChange(e.target.value)}
          className="w-full"
        >
          <option value="">施設を選択しない</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>メモ</Label>
        <Textarea
          rows={3}
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          placeholder="メモ..."
        />
      </div>
    </>
  );
}

export interface Step2FormProps {
  facilities: Facility[];
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  isTentative: boolean;
  placeName: string;
  placeUrl: string;
  memo: string;
  facilityId: string;
  isSubmitting: boolean;
  onBackClick: () => void;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onTentativeChange: (value: boolean) => void;
  onPlaceNameChange: (value: string) => void;
  onPlaceUrlChange: (value: string) => void;
  onMemoChange: (value: string) => void;
  onFacilityChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function Step2Form({
  facilities,
  date,
  startTime,
  endTime,
  title,
  isTentative,
  placeName,
  placeUrl,
  memo,
  facilityId,
  isSubmitting,
  onBackClick,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onTitleChange,
  onTentativeChange,
  onPlaceNameChange,
  onPlaceUrlChange,
  onMemoChange,
  onFacilityChange,
  onSubmit,
  onCancel,
}: Step2FormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4">
        <button
          type="button"
          onClick={onBackClick}
          className="flex items-center gap-2 text-coral font-medium mb-4 hover:text-coral/80 transition-colors"
        >
          <ChevronLeft size={20} />
          戻る
        </button>

        <BaseFields
          date={date}
          startTime={startTime}
          endTime={endTime}
          title={title}
          isTentative={isTentative}
          onDateChange={onDateChange}
          onStartTimeChange={onStartTimeChange}
          onEndTimeChange={onEndTimeChange}
          onTitleChange={onTitleChange}
          onTentativeChange={onTentativeChange}
        />

        <PlaceFields
          facilities={facilities}
          placeName={placeName}
          placeUrl={placeUrl}
          memo={memo}
          facilityId={facilityId}
          onPlaceNameChange={onPlaceNameChange}
          onPlaceUrlChange={onPlaceUrlChange}
          onMemoChange={onMemoChange}
          onFacilityChange={onFacilityChange}
        />
      </div>

      <div className="sticky bottom-0 flex gap-3 bg-white -mx-6 px-6 pt-3 pb-4 border-t border-cream">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting || !date || !title}>
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
