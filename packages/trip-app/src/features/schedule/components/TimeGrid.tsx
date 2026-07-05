import type { ScheduleItem } from "@/types/entities";
import type { LayoutItem } from "./calendarLayout";
import { computeLayout } from "./calendarLayout";
import { EventBlock } from "./EventBlock";

interface TimeGridProps {
  displayItems: ScheduleItem[];
  timedItems: ScheduleItem[];
  dragItemId: string | null;
  pxPerMin: number;
  onDelete: (id: string) => void;
  onPointerDown: (e: React.PointerEvent, item: ScheduleItem) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}

function GridLines({ pxPerMin }: { pxPerMin: number }) {
  return (
    <>
      {[...Array(25).keys()].map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-cream-dark"
          style={{ top: h * 60 * pxPerMin }}
        />
      ))}
      {[...Array(24).keys()].map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-cream"
          style={{ top: (h * 60 + 30) * pxPerMin }}
        />
      ))}
    </>
  );
}

function TimeAxis({ pxPerMin }: { pxPerMin: number }) {
  return (
    <div className="relative w-12 shrink-0">
      {[...Array(25).keys()].map((h) => (
        <div
          key={h}
          className="absolute right-0 left-0 flex justify-end pr-2"
          style={{ top: h * 60 * pxPerMin - 8 }}
        >
          <span className="text-xs text-ink-muted">{h}:00</span>
        </div>
      ))}
    </div>
  );
}

export function TimeGrid({
  displayItems,
  timedItems,
  dragItemId,
  pxPerMin,
  onDelete,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: TimeGridProps) {
  const timedItemsForLayout = dragItemId
    ? timedItems.filter((i) => i.id !== dragItemId)
    : timedItems;
  const layout: LayoutItem[] = computeLayout(timedItemsForLayout);

  const draggingItem = dragItemId ? displayItems.find((d) => d.id === dragItemId) : null;

  return (
    <div className="relative flex" style={{ height: 24 * 60 * pxPerMin }}>
      <TimeAxis pxPerMin={pxPerMin} />

      {/* Grid + events */}
      <div className="relative flex-1 border-l border-cream-dark">
        <GridLines pxPerMin={pxPerMin} />

        {/* Event blocks */}
        <div className="absolute inset-0 px-1">
          {layout.map(({ item, col, numCols }) => {
            const displayItem = displayItems.find((d) => d.id === item.id) ?? item;
            return (
              <EventBlock
                key={item.id}
                item={displayItem}
                col={col}
                numCols={numCols}
                pxPerMin={pxPerMin}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onDelete={onDelete}
              />
            );
          })}

          {/* Dragging item rendered separately at full width */}
          {draggingItem?.startTime && (
            <EventBlock
              item={draggingItem}
              col={0}
              numCols={1}
              pxPerMin={pxPerMin}
              isDragging
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
