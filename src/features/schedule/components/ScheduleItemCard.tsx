/**
 * src/features/schedule/components/ScheduleItemCard.tsx
 *
 * Card-only display for a single schedule item.
 * Layout (thumbnail + connecting line) is handled by ScheduleTimeline.
 */

import { Button } from "@/components/ui/button";
import { resolveEventType } from "@/lib/eventTypes";
import type { ScheduleItem } from "@/types/entities";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (mins > 0) return `${mins}分前`;
  return "たった今";
}

export interface ScheduleItemCardProps {
  item: ScheduleItem;
  canEdit?: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (item: ScheduleItem) => void;
}

export function ScheduleItemCard({
  item,
  canEdit = false,
  onEdit,
  onDelete,
}: ScheduleItemCardProps) {
  const eventType = resolveEventType(item.eventType);
  const Icon = eventType.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${eventType.color}20`, color: eventType.color }}
              >
                <Icon size={11} />
              </span>
              <span className="text-xs font-medium" style={{ color: eventType.color }}>
                {eventType.label}
              </span>
            </div>
            <h4 className="mt-1 font-semibold text-ink">{item.title}</h4>
            {item.placeName && <p className="mt-0.5 text-sm text-ink-muted">📍 {item.placeName}</p>}
          </div>
          {canEdit && (
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit?.(item)}>
                編集
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete?.(item)}>
                削除
              </Button>
            </div>
          )}
        </div>

        {item.memo && (
          <div className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm text-ink-muted">
            {item.memo}
          </div>
        )}
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="mt-2 h-32 w-full rounded-xl object-cover"
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-cream-dark px-4 py-2">
        <span className="text-xs text-ink-light">
          {item.updatedBy ? `${item.updatedBy} · ` : ""}
          {timeAgo(item.updatedAt)}
        </span>
        {item.placeUrl && (
          <a
            href={item.placeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-coral"
          >
            マップ
          </a>
        )}
      </div>
    </div>
  );
}
