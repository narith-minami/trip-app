/**
 * src/features/schedule/components/ScheduleCalendarView.tsx
 *
 * Google Calendar-style day view for dragging schedule items to new times.
 * Uses custom PointerEvents (not @dnd-kit) for time-grid drag with 10-min snap.
 */

import { Button } from "@/components/ui/button";
import { useScheduleItems } from "@/features/schedule/hooks/useScheduleItems";
import { useScheduleMutations } from "@/features/schedule/hooks/useScheduleMutations";
import { cn } from "@/lib/cn";
import type { ScheduleItem } from "@/types/entities";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// 1 minute = 1.5px → 1 hour = 90px → 24 hours = 2160px
const PX_PER_MIN = 1.5;
const SNAP_MIN = 10;
const TOTAL_PX = 24 * 60 * PX_PER_MIN;

const COLORS = [
  "#FF6B47",
  "#4F7EF7",
  "#2EC4B6",
  "#E9C46A",
  "#9B5DE5",
  "#F77F00",
  "#06D6A0",
];

function eventColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = ((hash * 31) + ch.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

function timeToMinutes(t: string | null | undefined): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function minutesToTime(min: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 50, min));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

function formatDayHeading(dateStr: string): string {
  if (!dateStr) return "";
  const [y, mo, d] = dateStr.split("-").map(Number);
  const dow = DOW[new Date(y, mo - 1, d).getDay()];
  return `${mo}/${d} (${dow})`;
}

interface LayoutItem {
  item: ScheduleItem;
  col: number;
  numCols: number;
}

function computeLayout(items: ScheduleItem[]): LayoutItem[] {
  const sorted = [...items].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const colEnds: number[] = [];
  const placed: Array<{ item: ScheduleItem; col: number }> = [];

  for (const item of sorted) {
    const start = timeToMinutes(item.startTime);
    const end = item.endTime ? timeToMinutes(item.endTime) : start + 60;
    let col = colEnds.findIndex((e) => e <= start);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(end);
    } else {
      colEnds[col] = end;
    }
    placed.push({ item, col });
  }

  const numCols = Math.max(1, colEnds.length);
  return placed.map((p) => ({ ...p, numCols }));
}

type PendingChange = { startTime: string; endTime: string };

export interface ScheduleCalendarViewProps {
  tripId: string;
  date: string;
  dates: string[];
  onBack: () => void;
}

export function ScheduleCalendarView({
  tripId,
  date,
  dates,
  onBack,
}: ScheduleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(date);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dragRef = useRef<{
    itemId: string;
    initialStartMin: number;
    duration: number;
    initialClientY: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: items } = useScheduleItems(tripId);
  const { update, remove, reorder } = useScheduleMutations(tripId);

  // Scroll to first event when date changes
  useEffect(() => {
    if (!scrollRef.current || !items?.length) return;
    const dateItems = items.filter((i) => i.date === currentDate && i.startTime);
    if (dateItems.length === 0) {
      scrollRef.current.scrollTop = 9 * 60 * PX_PER_MIN; // default to 9:00
      return;
    }
    const firstMin = Math.min(...dateItems.map((i) => timeToMinutes(i.startTime)));
    scrollRef.current.scrollTop = Math.max(0, firstMin * PX_PER_MIN - 80);
  }, [currentDate, items]);

  // Reset pending changes when date changes
  useEffect(() => {
    setPendingChanges(new Map());
    setDeletedIds(new Set());
  }, [currentDate]);

  const allDateItems = (items ?? []).filter((i) => i.date === currentDate);

  const displayItems = allDateItems
    .filter((i) => !deletedIds.has(i.id))
    .map((i) => {
      const pending = pendingChanges.get(i.id);
      if (!pending) return i;
      return { ...i, startTime: pending.startTime, endTime: pending.endTime };
    });

  const timedItems = displayItems.filter((i) => i.startTime);
  const untimedItems = displayItems.filter((i) => !i.startTime);
  const layout = computeLayout(timedItems);

  const handlePointerDown = (e: React.PointerEvent, item: ScheduleItem) => {
    // Only respond to primary pointer (left click / first touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

    const pending = pendingChanges.get(item.id);
    const startMin = pending ? timeToMinutes(pending.startTime) : timeToMinutes(item.startTime);
    const endMin = pending
      ? timeToMinutes(pending.endTime)
      : item.endTime
        ? timeToMinutes(item.endTime)
        : startMin + 60;

    dragRef.current = {
      itemId: item.id,
      initialStartMin: startMin,
      duration: endMin - startMin,
      initialClientY: e.clientY,
    };
    setDragItemId(item.id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const deltaY = e.clientY - dragRef.current.initialClientY;
    const deltaMin = deltaY / PX_PER_MIN;
    const rawStart = dragRef.current.initialStartMin + deltaMin;
    const snapped = Math.round(rawStart / SNAP_MIN) * SNAP_MIN;
    const clampedStart = Math.max(0, Math.min(23 * 60, snapped));
    const newStart = minutesToTime(clampedStart);
    const newEnd = minutesToTime(clampedStart + dragRef.current.duration);

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

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set([...prev, id]));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Delete items
      await Promise.all([...deletedIds].map((id) => remove.mutateAsync(id)));

      // 2. Apply time changes (skip deleted)
      const updateEntries = [...pendingChanges.entries()].filter(
        ([id]) => !deletedIds.has(id)
      );
      await Promise.all(
        updateEntries.map(([id, data]) =>
          update.mutateAsync({ itemId: id, data })
        )
      );

      // 3. Reorder survivors by startTime
      const survivors = allDateItems
        .filter((i) => !deletedIds.has(i.id))
        .map((i) => {
          const pending = pendingChanges.get(i.id);
          return pending ? { ...i, startTime: pending.startTime } : i;
        })
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      if (survivors.length > 1) {
        await reorder.mutateAsync(
          survivors.map((item, idx) => ({ id: item.id, orderIndex: idx }))
        );
      }

      onBack();
    } catch {
      toast.error("保存に失敗しました");
      setIsSaving(false);
    }
  };

  const dateIndex = dates.indexOf(currentDate);
  const prevDate = dateIndex > 0 ? dates[dateIndex - 1] : null;
  const nextDate = dateIndex < dates.length - 1 ? dates[dateIndex + 1] : null;

  return (
    <div className="flex h-dvh flex-col bg-cream">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ink-muted"
        >
          ← 戻る
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => prevDate && setCurrentDate(prevDate)}
            disabled={!prevDate}
            className="text-xl text-ink disabled:opacity-30"
            aria-label="前の日"
          >
            ‹
          </button>
          <h1 className="min-w-[96px] text-center font-bold text-ink">
            {formatDayHeading(currentDate)}
          </h1>
          <button
            type="button"
            onClick={() => nextDate && setCurrentDate(nextDate)}
            disabled={!nextDate}
            className="text-xl text-ink disabled:opacity-30"
            aria-label="次の日"
          >
            ›
          </button>
        </div>
        <div className="w-12" />
      </header>

      {/* Unscheduled items */}
      {untimedItems.length > 0 && (
        <section className="shrink-0 border-b bg-white px-4 py-2">
          <p className="mb-1 text-xs text-ink-muted">時刻未設定</p>
          <div className="flex flex-wrap gap-2">
            {untimedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-sm text-ink"
              >
                {item.title}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="ml-1 text-ink-muted hover:text-red-500"
                  aria-label="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Time grid (scrollable) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: TOTAL_PX }}>
          {/* Time axis */}
          <div className="relative w-12 shrink-0">
            {Array.from({ length: 25 }, (_, h) => (
              <div
                key={h}
                className="absolute right-0 left-0 flex justify-end pr-2"
                style={{ top: h * 60 * PX_PER_MIN - 8 }}
              >
                <span className="text-xs text-ink-muted">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Grid + events */}
          <div className="relative flex-1 border-l border-cream-dark">
            {/* Hour lines */}
            {Array.from({ length: 25 }, (_, h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-cream-dark"
                style={{ top: h * 60 * PX_PER_MIN }}
              />
            ))}
            {/* 30-min lines */}
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-cream"
                style={{ top: (h * 60 + 30) * PX_PER_MIN }}
              />
            ))}

            {/* Event blocks */}
            <div className="absolute inset-0 px-1">
              {layout.map(({ item, col, numCols }) => {
                const displayItem = displayItems.find((d) => d.id === item.id) ?? item;
                const startMin = timeToMinutes(displayItem.startTime);
                const endMin = displayItem.endTime
                  ? timeToMinutes(displayItem.endTime)
                  : startMin + 60;
                const durationMin = Math.max(10, endMin - startMin);
                const top = startMin * PX_PER_MIN;
                const height = Math.max(30, durationMin * PX_PER_MIN);
                const colWidth = 100 / numCols;
                const isDragging = dragItemId === item.id;
                const color = eventColor(item.id);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "absolute select-none touch-none overflow-hidden rounded-xl px-2 py-1",
                      "cursor-grab active:cursor-grabbing",
                      isDragging && "z-20 opacity-90 shadow-2xl ring-2 ring-white"
                    )}
                    style={{
                      top,
                      height,
                      left: `${col * colWidth}%`,
                      width: `calc(${colWidth}% - 4px)`,
                      background: color,
                    }}
                    onPointerDown={(e) => handlePointerDown(e, item)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    <p className="truncate text-xs font-bold text-white">
                      {displayItem.title}
                    </p>
                    {displayItem.startTime && (
                      <p className="text-xs text-white/80">
                        {displayItem.startTime}
                        {displayItem.endTime ? `–${displayItem.endTime}` : ""}
                      </p>
                    )}
                    <button
                      type="button"
                      className="absolute top-1 right-1 text-white/60 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      aria-label="削除"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex shrink-0 gap-3 bg-white px-4 py-3 shadow-[0_-1px_3px_rgba(0,0,0,0.08)]">
        <Button variant="secondary" className="flex-1" onClick={onBack}>
          キャンセル
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "保存中..." : "確定して保存"}
        </Button>
      </footer>
    </div>
  );
}
