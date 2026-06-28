/**
 * src/features/schedule/components/ScheduleTimeline.tsx
 *
 * Renders schedule items for a single selected date as a vertical timeline.
 * Supports drag-and-drop reordering when `onReorder` is provided.
 * Rejects drops that would place a later-timed item before an earlier-timed item.
 */

import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/cn";
import { resolveEventType } from "@/lib/eventTypes";
import type { ScheduleItem } from "@/types/entities";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ScheduleItemCard } from "./ScheduleItemCard";

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

function formatDayHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  return `${m}月${d}日（${dow}）`;
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="4" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="11" cy="4" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="11" cy="12" r="1.5" />
    </svg>
  );
}

function EventThumb({ item }: { item: ScheduleItem }) {
  const et = resolveEventType(item.eventType);
  const Icon = et.icon;
  return (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-2xl"
      style={{ backgroundColor: et.color }}
      aria-hidden="true"
    >
      <Icon size={20} color="white" strokeWidth={2} />
    </div>
  );
}

function detectTimeConflict(items: ScheduleItem[]): string | null {
  const timed = items.filter(
    (i): i is ScheduleItem & { startTime: string } =>
      typeof i.startTime === "string" && i.startTime.length > 0
  );
  for (let i = 1; i < timed.length; i++) {
    if (timed[i].startTime < timed[i - 1].startTime) {
      return `「${timed[i - 1].startTime}」の後に「${timed[i].startTime}」は置けません`;
    }
  }
  return null;
}

interface SortableScheduleRowProps {
  item: ScheduleItem;
  canEdit: boolean;
  showDragHandle: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (item: ScheduleItem) => void;
}

function SortableScheduleRow({
  item,
  canEdit,
  showDragHandle,
  onEdit,
  onDelete,
}: SortableScheduleRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-4">
      {/* Left: thumbnail + time — the colored circle acts as drag handle */}
      <div
        className={cn(
          "relative z-10 flex w-14 shrink-0 flex-col items-center gap-0.5",
          showDragHandle && "cursor-grab active:cursor-grabbing touch-none select-none"
        )}
        {...(showDragHandle ? { ...attributes, ...listeners } : {})}
      >
        {showDragHandle && (
          <span className="mb-0.5 text-ink-muted">
            <GripIcon />
          </span>
        )}
        <EventThumb item={item} />
        {item.startTime && <span className="text-xs text-ink-muted">{item.startTime}</span>}
      </div>

      {/* Right: card */}
      <div className="min-w-0 flex-1">
        <ScheduleItemCard item={item} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

function RowOverlay({ item }: { item: ScheduleItem }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl shadow-2xl">
      <div className="relative z-10 flex w-14 shrink-0 flex-col items-center gap-0.5">
        <span className="mb-0.5 text-ink-muted">
          <GripIcon />
        </span>
        <EventThumb item={item} />
        {item.startTime && <span className="text-xs text-ink-muted">{item.startTime}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <ScheduleItemCard item={item} canEdit={false} />
      </div>
    </div>
  );
}

export interface ScheduleTimelineProps {
  date: string;
  items: ScheduleItem[];
  canEdit?: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (item: ScheduleItem) => void;
  onReorder?: (items: Array<{ id: string; orderIndex: number }>) => void;
}

export function ScheduleTimeline({
  date,
  items,
  canEdit = false,
  onEdit,
  onDelete,
  onReorder,
}: ScheduleTimelineProps) {
  const [localItems, setLocalItems] = useState<ScheduleItem[]>(items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const prevItemsRef = useRef(items);

  useEffect(() => {
    if (items !== prevItemsRef.current) {
      prevItemsRef.current = items;
      setLocalItems(items);
    }
  }, [items]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = localItems.findIndex((i) => i.id === String(active.id));
    const newIndex = localItems.findIndex((i) => i.id === String(over.id));
    const reordered = arrayMove(localItems, oldIndex, newIndex);

    const conflict = detectTimeConflict(reordered);
    if (conflict) {
      toast.error(conflict);
      return;
    }

    setLocalItems(reordered);
    onReorder?.(reordered.map((item, idx) => ({ id: item.id, orderIndex: idx })));
  }

  if (localItems.length === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="この日の予定はまだありません"
        description="アイテムを追加して旅程を作りましょう。"
      />
    );
  }

  const activeItem = activeId ? localItems.find((i) => i.id === activeId) : null;
  const showDragHandle = !!onReorder;

  return (
    <div>
      {/* Day heading with horizontal rule */}
      {date && (
        <div className="mb-5 flex items-center gap-3">
          <h3 className="shrink-0 text-lg font-bold text-ink">{formatDayHeading(date)}</h3>
          <div className="h-px flex-1 bg-cream-dark" />
        </div>
      )}

      {/* Items with connecting vertical line */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={localItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="relative">
            {/* Continuous vertical line behind thumbnails */}
            {localItems.length > 1 && (
              <div
                className={cn(
                  "absolute w-0.5 bg-cream-dark",
                  showDragHandle
                    ? "left-[27px] top-[38px] bottom-[22px]"
                    : "left-[27px] top-[22px] bottom-[22px]"
                )}
              />
            )}
            <div className="space-y-4">
              {localItems.map((item) => (
                <SortableScheduleRow
                  key={item.id}
                  item={item}
                  canEdit={canEdit}
                  showDragHandle={showDragHandle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        </SortableContext>

        <DragOverlay>{activeItem ? <RowOverlay item={activeItem} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
