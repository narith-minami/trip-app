/**
 * src/features/schedule/components/ScheduleSection.tsx
 *
 * Schedule tab: date-picker row + filtered timeline for the selected day.
 */

import { useMemo, useState } from "react";
import { QueryBoundary } from "@/components/feedback/QueryBoundary";
import { useScheduleAlertsData } from "@/features/schedule/hooks/useScheduleAlerts";
import { useScheduleSection } from "@/features/schedule/hooks/useScheduleSection";
import { generateDateRange } from "@/lib/utils";
import type { Facility } from "@/types/entities";
import { DatePicker } from "./DatePicker";
import { ScheduleAlerts } from "./ScheduleAlerts";
import { ScheduleCopyDialog } from "./ScheduleCopyDialog";
import { ScheduleItemFormDialog } from "./ScheduleItemFormDialog";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { ScheduleToolbar } from "./ScheduleToolbar";

export interface ScheduleSectionProps {
  tripId: string;
  /** Trip's facilities, fetched by the route layer for the schedule-item facility selector. */
  facilities: Facility[];
  canEdit?: boolean;
  defaultDate?: string;
  startDate?: string;
  endDate?: string;
}

export function ScheduleSection({
  tripId,
  facilities,
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

  return (
    <QueryBoundary
      isLoading={sec.isLoading}
      error={sec.error}
      loadingLabel="スケジュールを読み込み中..."
      errorMessage="スケジュールの読み込みに失敗しました。"
    >
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
          tripId={tripId}
          date={selectedDate}
          items={items}
          canEdit={canEdit}
          onEdit={sec.openEdit}
          onReorder={canEdit ? sec.handleReorder : undefined}
          onUploadImage={sec.handleUploadImage}
          onDeleteImage={sec.handleDeleteImage}
        />
        <ScheduleItemFormDialog
          facilities={facilities}
          isOpen={sec.isOpen}
          editing={sec.editing}
          defaultDate={selectedDate || (defaultDate ?? "")}
          isSubmitting={sec.isSubmitting}
          isDeleting={sec.isDeleting}
          onSubmit={sec.handleSubmit}
          onClose={sec.close}
          onDelete={sec.handleDelete}
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
    </QueryBoundary>
  );
}
