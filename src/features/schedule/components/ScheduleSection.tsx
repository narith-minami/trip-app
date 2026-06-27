/**
 * src/features/schedule/components/ScheduleSection.tsx
 *
 * Schedule tab: date-picker row + filtered timeline for the selected day.
 */

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useScheduleSection } from "@/features/schedule/hooks/useScheduleSection";
import { cn } from "@/lib/cn";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ScheduleItemForm } from "./ScheduleItemForm";
import { ScheduleTimeline } from "./ScheduleTimeline";

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

function generateDateRange(start: string, end: string): string[] {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const dates: string[] = [];
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    dates.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

interface DateCardProps {
  dateStr: string;
  isSelected: boolean;
  hasItems: boolean;
  onClick: () => void;
}

function DateCard({ dateStr, isSelected, hasItems, onClick }: DateCardProps) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2.5 transition-all",
        isSelected
          ? "bg-navy text-white"
          : "border border-cream-dark bg-white text-ink hover:bg-cream"
      )}
    >
      <span className={cn("text-xs", isSelected ? "text-cream-mid" : "text-ink-muted")}>{dow}</span>
      <span
        className={cn("text-2xl font-bold leading-tight", isSelected ? "text-white" : "text-ink")}
      >
        {d}
      </span>
      <span
        className="mt-1.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hasItems ? "#FF6B47" : "transparent" }}
      />
    </button>
  );
}

interface DatePickerProps {
  dates: string[];
  selectedDate: string;
  datesWithItems: Set<string>;
  onSelect: (d: string) => void;
}

function DatePicker({ dates, selectedDate, datesWithItems, onSelect }: DatePickerProps) {
  if (dates.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm text-ink-muted">日付を選択</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => (
          <DateCard
            key={d}
            dateStr={d}
            isSelected={d === selectedDate}
            hasItems={datesWithItems.has(d)}
            onClick={() => onSelect(d)}
          />
        ))}
      </div>
    </div>
  );
}

export interface ScheduleSectionProps {
  tripId: string;
  canEdit?: boolean;
  defaultDate?: string;
  startDate?: string;
  endDate?: string;
}

export function ScheduleSection({
  tripId,
  canEdit = false,
  defaultDate,
  startDate,
  endDate,
}: ScheduleSectionProps) {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    editing,
    isOpen,
    openCreate,
    openEdit,
    close,
    handleSubmit,
    handleDelete,
    handleReorder,
    isSubmitting,
    groupsMap,
  } = useScheduleSection(tripId);

  const dates = startDate && endDate ? generateDateRange(startDate, endDate) : [];
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate ?? dates[0] ?? "");

  if (isLoading) return <LoadingSpinner label="スケジュールを読み込み中..." />;
  if (error) return <p className="text-red-600">スケジュールの読み込みに失敗しました。</p>;

  return (
    <div className="space-y-5">
      {canEdit && (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              navigate({
                to: "/trips/$tripId/schedule-edit",
                params: { tripId },
                search: { date: selectedDate },
              })
            }
          >
            カレンダー編集
          </Button>
          <Button onClick={openCreate}>+ アイテム追加</Button>
        </div>
      )}

      <DatePicker
        dates={dates}
        selectedDate={selectedDate}
        datesWithItems={new Set(groupsMap.keys())}
        onSelect={setSelectedDate}
      />

      <ScheduleTimeline
        date={selectedDate}
        items={groupsMap.get(selectedDate) ?? []}
        canEdit={canEdit}
        onEdit={openEdit}
        onDelete={handleDelete}
        onReorder={canEdit ? handleReorder : undefined}
      />

      <Dialog
        open={isOpen}
        onClose={close}
        title={editing ? "スケジュール編集" : "スケジュール追加"}
      >
        <ScheduleItemForm
          initial={editing ?? undefined}
          defaultDate={selectedDate || defaultDate}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </Dialog>
    </div>
  );
}
