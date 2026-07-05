import { useRef, useState } from "react";
import type { ScheduleItem } from "@/types/entities";
import { minutesToTime, type PendingChange, SNAP_MIN, timeToMinutes } from "./calendarLayout";

export interface UseCalendarDragResult {
  dragItemId: string | null;
  pendingChanges: Map<string, PendingChange>;
  dragRef: React.RefObject<{
    itemId: string;
    initialStartMin: number;
    duration: number;
    initialClientY: number;
  } | null>;
  setPendingChanges: React.Dispatch<React.SetStateAction<Map<string, PendingChange>>>;
  handlePointerDown: (e: React.PointerEvent, item: ScheduleItem) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
}

interface DragPosition {
  newStart: string;
  newEnd: string;
}

function calcDragPosition(
  drag: { initialStartMin: number; duration: number; initialClientY: number },
  clientY: number,
  pxPerMin: number
): DragPosition {
  const deltaY = clientY - drag.initialClientY;
  const deltaMin = deltaY / pxPerMin;
  const rawStart = drag.initialStartMin + deltaMin;
  const snapped = Math.round(rawStart / SNAP_MIN) * SNAP_MIN;
  const maxStart = Math.max(0, 23 * 60 + 50 - drag.duration);
  const clampedStart = Math.max(0, Math.min(maxStart, snapped));
  return {
    newStart: minutesToTime(clampedStart),
    newEnd: minutesToTime(clampedStart + drag.duration),
  };
}

function initDragState(item: ScheduleItem, pending: PendingChange | undefined, clientY: number) {
  const startMin = pending ? timeToMinutes(pending.startTime) : timeToMinutes(item.startTime);
  const endMin = pending
    ? timeToMinutes(pending.endTime)
    : item.endTime
      ? timeToMinutes(item.endTime)
      : startMin + 60;
  return {
    itemId: item.id,
    initialStartMin: startMin,
    duration: endMin - startMin,
    initialClientY: clientY,
  };
}

export function useCalendarDrag(
  pxPerMinRef: React.RefObject<number>,
  pendingChanges: Map<string, PendingChange>,
  setPendingChanges: React.Dispatch<React.SetStateAction<Map<string, PendingChange>>>
): UseCalendarDragResult {
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const dragRef = useRef<{
    itemId: string;
    initialStartMin: number;
    duration: number;
    initialClientY: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, item: ScheduleItem) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = initDragState(item, pendingChanges.get(item.id), e.clientY);
    setDragItemId(item.id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { newStart, newEnd } = calcDragPosition(dragRef.current, e.clientY, pxPerMinRef.current);
    const id = dragRef.current.itemId;
    setPendingChanges((prev) => {
      const next = new Map(prev);
      next.set(id, { startTime: newStart, endTime: newEnd });
      return next;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setDragItemId(null);
  };

  return {
    dragItemId,
    pendingChanges,
    dragRef,
    setPendingChanges,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
