import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleToolbarProps {
  tripId: string;
  selectedDate: string;
  canEdit: boolean;
  datesLength: number;
  hasItems: boolean;
  onCopy: () => void;
  onAdd: () => void;
}

export function ScheduleToolbar({
  tripId,
  selectedDate,
  canEdit,
  datesLength,
  hasItems,
  onCopy,
  onAdd,
}: ScheduleToolbarProps) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="secondary"
        onClick={() => navigate({ to: "/trips/$tripId/itinerary", params: { tripId } })}
      >
        全日程を表示する
      </Button>
      {canEdit && (
        <>
          <Button
            variant="secondary"
            onClick={() =>
              navigate({
                to: "/trips/$tripId/schedule-edit",
                params: { tripId },
                search: { date: selectedDate },
              })
            }
          >
            カレンダー編集
          </Button>
          <Button variant="secondary" onClick={onCopy} disabled={datesLength <= 1 || !hasItems}>
            コピー
          </Button>
          <Button onClick={onAdd}>
            <span className="inline-flex items-center gap-1">
              <Plus size={16} aria-hidden="true" />
              アイテム追加
            </span>
          </Button>
        </>
      )}
    </div>
  );
}
