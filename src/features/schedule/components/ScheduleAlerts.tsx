import { BedDouble, Plane, Utensils } from "lucide-react";
import type { AlertType } from "../hooks/useScheduleAlerts";

const ALERT_CONFIG: Record<AlertType, { icon: typeof Plane; label: string }> = {
  hotel: { icon: BedDouble, label: "ホテルの予定が未登録です" },
  food: { icon: Utensils, label: "食事の予定が未登録です" },
  transport: { icon: Plane, label: "移動手段（飛行機・電車）が未登録です" },
};

interface ScheduleAlertsProps {
  missing: AlertType[];
}

export function ScheduleAlerts({ missing }: ScheduleAlertsProps) {
  if (missing.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <ul className="space-y-1.5">
        {missing.map((type) => {
          const { icon: Icon, label } = ALERT_CONFIG[type];
          return (
            <li key={type} className="flex items-center gap-2 text-sm text-amber-800">
              <Icon size={15} className="shrink-0 text-amber-500" />
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
