/**
 * src/features/schedule/components/ScheduleTimeline.tsx
 *
 * Renders schedule items grouped by date as a vertical timeline.
 */

import { EmptyState } from "@/components/feedback/EmptyState";
import type { ScheduleItem } from "@/types/entities";
import { ScheduleItemCard } from "./ScheduleItemCard";

export interface ScheduleTimelineProps {
  /** Date-keyed groups, ordered as they should appear. */
  groups: [string, ScheduleItem[]][];
  canEdit?: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (item: ScheduleItem) => void;
}

export function ScheduleTimeline({
  groups,
  canEdit = false,
  onEdit,
  onDelete,
}: ScheduleTimelineProps) {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon="🗓️"
        title="No schedule items yet"
        description="Add your first plan to start building the itinerary."
      />
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(([date, items]) => (
        <section key={date}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            {date}
          </h3>
          <div className="space-y-3 border-l-2 border-cream-dark pl-4">
            {items.map((item) => (
              <ScheduleItemCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
