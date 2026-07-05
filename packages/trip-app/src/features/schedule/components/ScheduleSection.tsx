/**
 * src/features/schedule/components/ScheduleSection.tsx
 *
 * Schedule tab: date-picker row + filtered timeline for the selected day.
 */

import { useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useScheduleAlertsData } from "@/features/schedule/hooks/useScheduleAlerts";
import { useScheduleSection } from "@/features/schedule/hooks/useScheduleSection";
import { DatePicker } from "./DatePicker";
import { ScheduleAlerts } from "./ScheduleAlerts";
import { ScheduleCopyDialog } from "./ScheduleCopyDialog";
import { ScheduleItemFormDialog } from "./ScheduleItemFormDialog";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { ScheduleToolbar } from "./ScheduleToolbar";

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
  const sec = useScheduleSection(tripId);
  const dates = useMemo(
    () => (startDate && endDate ? generateDateRange(startDate, endDate) : []),
    [startDate, endDate]
  );
  const [selectedDate, setSelectedDate] = useState(defaultDate ?? dates[0] ?? "");
  const { alertCountByDate, selectedMissing } = useScheduleAlertsData(
    sec.groupsMap,
    dates,
    selectedDate
  );
  const items = sec.groupsMap.get(selectedDate) ?? [];
  if (sec.isLoading) return <LoadingSpinner label="スケジュールを読み込み中..." />;
  if (sec.error) return <p className="text-red-600">スケジュールの読み込みに失敗しました。</p>;

  return (
    <div className="space-y-5">
      <ScheduleToolbar
        tripId={tripId}
        selectedDate={selectedDate}
        canEdit={canEdit}
        datesLength={dates.length}
        hasItems={items.length > 0}
        onCopy={() => sec.setCopyOpen(true)}
        onAdd={sec.openCreate}
      />
      <DatePicker
        dates={dates}
        selectedDate={selectedDate}
        datesWithItems={new Set(sec.groupsMap.keys())}
        alertCountByDate={alertCountByDate}
        onSelect={setSelectedDate}
      />
      <ScheduleAlerts missing={selectedMissing} />
      <ScheduleTimeline
        date={selectedDate}
        items={items}
        canEdit={canEdit}
        onEdit={sec.openEdit}
        onDelete={sec.handleDelete}
        onReorder={canEdit ? sec.handleReorder : undefined}
      />
      <ScheduleItemFormDialog
        isOpen={sec.isOpen}
        editing={sec.editing}
        defaultDate={selectedDate || (defaultDate ?? "")}
        isSubmitting={sec.isSubmitting}
        onSubmit={sec.handleSubmit}
        onClose={sec.close}
      />
      {sec.copyOpen && (
        <ScheduleCopyDialog
          sourceDate={selectedDate}
          items={items}
          dates={dates}
          onCopy={(t, ids) => sec.handleCopy(t, ids, setSelectedDate)}
          onClose={() => sec.setCopyOpen(false)}
          isSubmitting={sec.copyIsPending}
        />
      )}
    </div>
  );
}
