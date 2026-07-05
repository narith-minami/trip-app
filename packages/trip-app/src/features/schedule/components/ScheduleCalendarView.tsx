/**
 * src/features/schedule/components/ScheduleCalendarView.tsx
 *
 * Google Calendar-style day view for dragging schedule items to new times.
 * Uses custom PointerEvents (not @dnd-kit) for time-grid drag with 10-min snap.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePinchZoom } from "@/features/schedule/hooks/usePinchZoom";
import { CalendarFooter } from "./CalendarFooter";
import { CalendarHeader } from "./CalendarHeader";
import { computeDisplayItems, PX_PER_MIN } from "./calendarLayout";
import { TimeGrid } from "./TimeGrid";
import { UnscheduledItems } from "./UnscheduledItems";
import { useCalendarDrag } from "./useCalendarDrag";
import { useCalendarScroll } from "./useCalendarScroll";
import { useScheduleSave } from "./useScheduleSave";

export interface ScheduleCalendarViewProps {
  tripId: string;
  date: string;
  dates: string[];
  onBack: () => void;
}

export function ScheduleCalendarView({ tripId, date, dates, onBack }: ScheduleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(date);
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, { startTime: string; endTime: string }>
  >(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const getScrollEl = useCallback(() => scrollRef.current, []);
  const { pxPerMin, pxPerMinRef, consumePendingScroll } = usePinchZoom({
    scrollRef,
    initialPxPerMin: PX_PER_MIN,
  });
  const { isSaving, handleSave, allDateItems } = useScheduleSave({
    tripId,
    currentDate,
    deletedIds,
    pendingChanges,
    onBack,
  });
  useCalendarScroll({
    getElement: getScrollEl,
    items: allDateItems,
    currentDate,
    pxPerMinRef,
    consumePendingScroll,
  });

  useEffect(() => {
    setPendingChanges(new Map());
    setDeletedIds(new Set());
  }, []);

  const displayItems = computeDisplayItems(allDateItems, deletedIds, pendingChanges);
  const timedItems = displayItems.filter((i) => i.startTime);
  const untimedItems = displayItems.filter((i) => !i.startTime);
  const { dragItemId, handlePointerDown, handlePointerMove, handlePointerUp } = useCalendarDrag(
    pxPerMinRef,
    pendingChanges,
    setPendingChanges
  );
  const handleDelete = (id: string) => setDeletedIds((prev) => new Set([...prev, id]));
  const dateIndex = dates.indexOf(currentDate);
  const prevDate = dateIndex > 0 ? dates[dateIndex - 1] : null;
  const nextDate = dateIndex < dates.length - 1 ? dates[dateIndex + 1] : null;

  return (
    <div className="flex h-dvh flex-col bg-cream">
      <CalendarHeader
        currentDate={currentDate}
        prevDate={prevDate}
        nextDate={nextDate}
        onBack={onBack}
        onSelectDate={setCurrentDate}
      />
      <UnscheduledItems items={untimedItems} onDelete={handleDelete} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <TimeGrid
          displayItems={displayItems}
          timedItems={timedItems}
          dragItemId={dragItemId}
          pxPerMin={pxPerMin}
          onDelete={handleDelete}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      <CalendarFooter isSaving={isSaving} onCancel={onBack} onSave={handleSave} />
    </div>
  );
}
