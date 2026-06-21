/**
 * src/features/schedule/components/ScheduleItemCard.tsx
 *
 * Presentational card for a single schedule item.
 */

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { ScheduleItem } from "@/types/entities";

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
  return (
    <Card className="border border-gray-100">
      <CardBody className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {item.startTime && (
              <span className="text-sm font-semibold text-blue-600">{item.startTime}</span>
            )}
            <h4 className="truncate font-medium text-gray-900">{item.title}</h4>
          </div>

          {item.placeName && <p className="mt-1 text-sm text-gray-700">📍 {item.placeName}</p>}
          {item.placeUrl && (
            <a
              href={item.placeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-blue-600 hover:underline"
            >
              Open map
            </a>
          )}
          {item.memo && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{item.memo}</p>
          )}
        </div>

        {canEdit && (
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit?.(item)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete?.(item)}>
              Delete
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
