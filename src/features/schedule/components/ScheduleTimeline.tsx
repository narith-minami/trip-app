/**
 * src/features/schedule/components/ScheduleTimeline.tsx
 *
 * Renders schedule items for a single selected date as a vertical timeline.
 * Each item has a coloured thumbnail on the left connected by a vertical line.
 */

import { EmptyState } from "@/components/feedback/EmptyState";
import type { ScheduleItem } from "@/types/entities";
import { ScheduleItemCard } from "./ScheduleItemCard";

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

const THUMB_COLORS = ["#D4A854", "#FF6B47", "#5B8A6F", "#1A2E48"] as const;

function thumbColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return THUMB_COLORS[h % THUMB_COLORS.length];
}

function formatDayHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  return `${m}月${d}日（${dow}）`;
}

export interface ScheduleTimelineProps {
  date: string;
  items: ScheduleItem[];
  canEdit?: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (item: ScheduleItem) => void;
}

export function ScheduleTimeline({
  date,
  items,
  canEdit = false,
  onEdit,
  onDelete,
}: ScheduleTimelineProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="この日の予定はまだありません"
        description="アイテムを追加して旅程を作りましょう。"
      />
    );
  }

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
      <div className="relative">
        {/* Continuous vertical line behind thumbnails (z-0) */}
        {items.length > 1 && (
          <div className="absolute left-[27px] top-[22px] bottom-[22px] w-0.5 bg-cream-dark" />
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              {/* Left: thumbnail + time, centered over the line */}
              <div className="relative z-10 flex w-14 shrink-0 flex-col items-center gap-1">
                <div
                  className="h-11 w-11 rounded-2xl"
                  style={{ background: thumbColor(item.id) }}
                  aria-hidden="true"
                />
                {item.startTime && <span className="text-xs text-ink-muted">{item.startTime}</span>}
              </div>

              {/* Right: card */}
              <div className="min-w-0 flex-1">
                <ScheduleItemCard
                  item={item}
                  canEdit={canEdit}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
