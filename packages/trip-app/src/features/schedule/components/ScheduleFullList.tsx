/**
 * src/features/schedule/components/ScheduleFullList.tsx
 *
 * Read-only view of every schedule item across the whole trip period,
 * grouped by day and shown in a single scrollable list. Tapping an item
 * opens its full details in a dialog.
 */

import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Dialog } from "@/components/ui/dialog";
import { groupByDate, useScheduleItems } from "@/features/schedule/hooks/useScheduleItems";
import type { ScheduleItem } from "@/types/entities";
import { ScheduleItemCard } from "./ScheduleItemCard";
import { EventThumb } from "./ScheduleTimeline";

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

function formatDayHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  return `${m}月${d}日（${dow}）`;
}

function generateDateRange(start: string, end: string): string[] {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const dates: string[] = [];
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    dates.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

interface ScheduleFullListRowProps {
  item: ScheduleItem;
  onSelect: (item: ScheduleItem) => void;
}

function ScheduleFullListRow({ item, onSelect }: ScheduleFullListRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="flex w-full items-center gap-3 rounded-xl border border-cream-dark bg-white px-3 py-2.5 text-left shadow-sm active:bg-cream"
    >
      <EventThumb item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.startTime && <span className="text-xs text-ink-muted">{item.startTime}</span>}
          <span className="truncate font-medium text-ink">{item.title}</span>
        </div>
        {item.placeName && <p className="truncate text-xs text-ink-muted">📍 {item.placeName}</p>}
      </div>
    </button>
  );
}

export interface ScheduleFullListProps {
  tripId: string;
  startDate: string;
  endDate: string;
}

export function ScheduleFullList({ tripId, startDate, endDate }: ScheduleFullListProps) {
  const { data: items, isLoading, error } = useScheduleItems(tripId);
  const [selected, setSelected] = useState<ScheduleItem | null>(null);

  if (isLoading) return <LoadingSpinner label="スケジュールを読み込み中..." />;
  if (error) return <p className="text-red-600">スケジュールの読み込みに失敗しました。</p>;

  const groupsMap = groupByDate(items ?? []);
  const dates =
    startDate && endDate
      ? generateDateRange(startDate, endDate).filter((d) => groupsMap.has(d))
      : [];

  if (dates.length === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="予定はまだありません"
        description="日程タブからアイテムを追加して旅程を作りましょう。"
      />
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((date) => (
        <div key={date}>
          <div className="mb-2 flex items-center gap-3">
            <h3 className="shrink-0 text-lg font-bold text-ink">{formatDayHeading(date)}</h3>
            <div className="h-px flex-1 bg-cream-dark" />
          </div>
          <div className="space-y-2">
            {(groupsMap.get(date) ?? []).map((item) => (
              <ScheduleFullListRow key={item.id} item={item} onSelect={setSelected} />
            ))}
          </div>
        </div>
      ))}
      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted">
              {formatDayHeading(selected.date)}
              {selected.startTime &&
                ` ・ ${selected.startTime}${selected.endTime ? `〜${selected.endTime}` : ""}`}
            </p>
            <ScheduleItemCard item={selected} />
          </div>
        )}
      </Dialog>
    </div>
  );
}
