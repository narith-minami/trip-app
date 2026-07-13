import { useNavigate } from "@tanstack/react-router";
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
        onClick={() => navigate({ to: "/trips/$tripId/all-schedule", params: { tripId } })}
      >
        すべての予定を見る
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
          <Button onClick={onAdd}>+ アイテム追加</Button>
        </>
      )}
    </div>
  );
}
