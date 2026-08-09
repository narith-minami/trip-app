/**
 * src/features/schedule/components/ScheduleTimeline.tsx
 *
 * Renders schedule items for a single selected date as a vertical timeline.
 * Supports drag-and-drop reordering when `onReorder` is provided.
 * Rejects drops that would place a later-timed item before an earlier-timed item.
 */

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/cn";
import { JA_DOW, parseLocalDate } from "@/lib/japaneseDate";
import type { ScheduleItem } from "@/types/entities";
import { RowOverlay, SortableScheduleRow } from "./ScheduleTimelineRow";

export function formatDayHeading(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const dow = JA_DOW[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日（${dow}）`;
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

export interface ScheduleTimelineProps {
  tripId: string;
  date: string;
  items: ScheduleItem[];
  canEdit?: boolean;
  /** Set to false to suppress the built-in day heading when the caller renders its own. */
  showHeading?: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onReorder?: (items: Array<{ id: string; orderIndex: number }>) => void;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
}

interface TimelineContentProps {
  tripId: string;
  date: string;
  showHeading: boolean;
  localItems: ScheduleItem[];
  showDragHandle: boolean;
  activeId: string | null;
  canEdit: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
  sensors: ReturnType<typeof useSensors>;
  onActiveIdChange: (id: string) => void;
  onDragEnd: (e: DragEndEvent) => void;
  onDragCancel: () => void;
}

function TimelineContent({
  tripId,
  date,
  showHeading,
  localItems,
  showDragHandle,
  activeId,
  canEdit,
  onEdit,
  onUploadImage,
  onDeleteImage,
  sensors,
  onActiveIdChange,
  onDragEnd,
  onDragCancel,
}: TimelineContentProps) {
  const activeItem = activeId ? localItems.find((i) => i.id === activeId) : null;
  return (
    <div>
      {showHeading && date && (
        <div className="mb-5 flex items-center gap-3">
          <h3 className="shrink-0 text-lg font-bold text-ink">{formatDayHeading(date)}</h3>
          <div className="h-px flex-1 bg-cream-dark" />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => onActiveIdChange(String(e.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <SortableContext items={localItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="relative">
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
                  tripId={tripId}
                  item={item}
                  canEdit={canEdit}
                  showDragHandle={showDragHandle}
                  onEdit={onEdit}
                  onUploadImage={onUploadImage}
                  onDeleteImage={onDeleteImage}
                />
              ))}
            </div>
          </div>
        </SortableContext>
        <DragOverlay>
          {activeItem ? <RowOverlay tripId={tripId} item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export function ScheduleTimeline({
  tripId,
  date,
  items,
  canEdit = false,
  showHeading = true,
  onEdit,
  onReorder,
  onUploadImage,
  onDeleteImage,
}: ScheduleTimelineProps) {
  // react-doctor-disable-next-line react-doctor/no-derived-useState -- local drag draft must seed its initial value from the items prop
  const [localItems, setLocalItems] = useState<ScheduleItem[]>(items);
  // `baseline` is the upstream `items` this draft was last synced to, read during
  // render (below) to drive the sync — React's "store info from previous render"
  // pattern.
  // react-doctor-disable-next-line react-doctor/no-derived-useState, react-doctor/rerender-state-only-in-handlers -- tracks last-synced items to drive the render-time sync, per the React docs pattern
  const [baseline, setBaseline] = useState<ScheduleItem[]>(items);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Adjust state during render instead of in an effect (AGENTS.md #2). Skipped
  // while a drag is in flight so a background refetch never yanks localItems
  // out from under an active drag gesture; the latest items are adopted as
  // soon as the drag ends.
  if (items !== baseline && activeId === null) {
    setBaseline(items);
    setLocalItems(items);
  }

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
        icon={<CalendarDays size={40} strokeWidth={1.5} />}
        title="この日の予定はまだありません"
        description="アイテムを追加して旅程を作りましょう。"
      />
    );
  }

  return (
    <TimelineContent
      tripId={tripId}
      date={date}
      showHeading={showHeading}
      localItems={localItems}
      showDragHandle={!!onReorder}
      activeId={activeId}
      canEdit={canEdit}
      onEdit={onEdit}
      onUploadImage={onUploadImage}
      onDeleteImage={onDeleteImage}
      sensors={sensors}
      onActiveIdChange={setActiveId}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    />
  );
}
