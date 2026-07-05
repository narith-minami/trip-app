import type { ScheduleItem } from "@/types/entities";
import { eventColor, timeToMinutes } from "./calendarLayout";

interface EventBlockProps {
  item: ScheduleItem;
  col: number;
  numCols: number;
  pxPerMin: number;
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent, item: ScheduleItem) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
  onDelete: (id: string) => void;
}

export function EventBlock({
  item,
  col,
  numCols,
  pxPerMin,
  isDragging = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onDelete,
}: EventBlockProps) {
  const startMin = timeToMinutes(item.startTime);
  const endMin = item.endTime ? timeToMinutes(item.endTime) : startMin + 60;
  const durationMin = Math.max(10, endMin - startMin);
  const top = startMin * pxPerMin;
  const height = Math.max(30, durationMin * pxPerMin);
  const colWidth = 100 / numCols;
  const color = eventColor(item.id);

  const draggingClass = isDragging
    ? "z-30 opacity-90 shadow-2xl ring-2 ring-white"
    : "cursor-grab active:cursor-grabbing";

  return (
    <div
      className={`absolute select-none touch-none overflow-hidden rounded-xl px-2 py-1 ${draggingClass}`}
      style={{
        top,
        height,
        left: isDragging ? 0 : `${col * colWidth}%`,
        width: isDragging ? "calc(100% - 4px)" : `calc(${colWidth}% - 4px)`,
        background: color,
      }}
      onPointerDown={onPointerDown ? (e) => onPointerDown(e, item) : undefined}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <p className="truncate text-xs font-bold text-white">{item.title}</p>
      {item.startTime && (
        <p className="text-xs text-white/80">
          {item.startTime}
          {item.endTime ? `–${item.endTime}` : ""}
        </p>
      )}
      <button
        type="button"
        className="absolute top-1 right-1 text-white/60 hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        aria-label="削除"
      >
        ×
      </button>
    </div>
  );
}
