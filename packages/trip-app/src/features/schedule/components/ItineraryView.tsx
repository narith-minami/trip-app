/**
 * src/features/schedule/components/ItineraryView.tsx
 *
 * Read-only viewer that renders the entire trip's schedule across all days
 * in a single scrollable view. No edit / delete / drag-and-drop controls.
 */

import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { QueryBoundary } from "@/components/feedback/QueryBoundary";
import { groupByDate, useScheduleItems } from "@/features/schedule/hooks/useScheduleItems";
import type { ScheduleItem } from "@/types/entities";
import { formatDayHeading, ScheduleTimeline } from "./ScheduleTimeline";

export interface ItineraryViewProps {
  tripId: string;
  dates: string[];
}

export function ItineraryView({ tripId, dates }: ItineraryViewProps) {
  const { data: items, isLoading, error } = useScheduleItems(tripId);
  const groupsMap = groupByDate(items ?? []);
  const totalItems = items?.length ?? 0;

  return (
    <QueryBoundary
      isLoading={isLoading}
      error={error}
      loadingLabel="旅程を読み込み中..."
      errorMessage="旅程の読み込みに失敗しました。"
    >
      {dates.length === 0 || totalItems === 0 ? (
        <EmptyState
          icon={<CalendarDays size={40} strokeWidth={1.5} />}
          title="まだ旅程がありません"
          description="日程に予定が追加されるとここに表示されます。"
        />
      ) : (
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
                  <ScheduleTimeline
                    tripId={tripId}
                    date={date}
                    items={dayItems}
                    canEdit={false}
                    showHeading={false}
                  />
                ) : (
                  <p className="py-4 text-sm text-ink-muted">予定なし</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </QueryBoundary>
  );
}
