/**
 * src/features/schedule/components/ItineraryView.tsx
 *
 * Read-only viewer that renders the entire trip's schedule across all days
 * in a single scrollable view. No edit / delete / drag-and-drop controls.
 */

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { groupByDate, useScheduleItems } from "@/features/schedule/hooks/useScheduleItems";
import type { ScheduleItem } from "@/types/entities";
import { formatDayHeading, ScheduleTimeline } from "./ScheduleTimeline";

export interface ItineraryViewProps {
  tripId: string;
  dates: string[];
}

export function ItineraryView({ tripId, dates }: ItineraryViewProps) {
  const { data: items, isLoading, error } = useScheduleItems(tripId);

  if (isLoading) return <LoadingSpinner label="旅程を読み込み中..." />;
  if (error) return <p className="text-red-600">旅程の読み込みに失敗しました。</p>;

  const groupsMap = groupByDate(items ?? []);
  const totalItems = items?.length ?? 0;

  if (dates.length === 0 || totalItems === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="まだ旅程がありません"
        description="日程に予定が追加されるとここに表示されます。"
      />
    );
  }

  return (
    <div className="space-y-8">
      {dates.map((date) => {
        const dayItems: ScheduleItem[] = groupsMap.get(date) ?? [];
        return (
          <section key={date} aria-label={formatDayHeading(date)}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="shrink-0 text-lg font-bold text-ink">{formatDayHeading(date)}</h2>
              <div className="h-px flex-1 bg-cream-dark" />
            </div>
            {dayItems.length > 0 ? (
              <ScheduleTimeline date={date} items={dayItems} canEdit={false} showHeading={false} />
            ) : (
              <p className="py-4 text-sm text-ink-muted">予定なし</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
