/**
 * src/features/schedule/components/ScheduleTimelineRow.tsx
 *
 * A single draggable timeline row (thumbnail + card) and its drag-overlay
 * twin, split out of ScheduleTimeline.tsx to keep that file under the
 * max-lines limit.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { resolveEventType } from "@/lib/eventTypes";
import type { ScheduleItem } from "@/types/entities";
import { ScheduleItemCard } from "./ScheduleItemCard";

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
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl",
        item.isTentative === 1 && "grayscale opacity-50"
      )}
      style={{ backgroundColor: et.color }}
      aria-hidden="true"
    >
      <Icon size={20} color="white" strokeWidth={2} />
    </div>
  );
}

interface SortableScheduleRowProps {
  tripId: string;
  item: ScheduleItem;
  canEdit: boolean;
  showDragHandle: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
}

export function SortableScheduleRow({
  tripId,
  item,
  canEdit,
  showDragHandle,
  onEdit,
  onUploadImage,
  onDeleteImage,
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
        <ScheduleItemCard
          tripId={tripId}
          item={item}
          canEdit={canEdit}
          onEdit={onEdit}
          onUploadImage={onUploadImage}
          onDeleteImage={onDeleteImage}
        />
      </div>
    </div>
  );
}

export function RowOverlay({ tripId, item }: { tripId: string; item: ScheduleItem }) {
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
        <ScheduleItemCard tripId={tripId} item={item} canEdit={false} />
      </div>
    </div>
  );
}
