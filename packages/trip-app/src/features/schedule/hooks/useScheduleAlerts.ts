import type { ScheduleItem } from "@/types/entities";

export type AlertType = "hotel" | "food" | "transport";

export interface DayAlert {
  date: string;
  missing: AlertType[];
}

export function computeScheduleAlerts(
  groupsMap: Map<string, ScheduleItem[]>,
  dates: string[],
): DayAlert[] {
  if (dates.length === 0) return [];
  const isMultiDay = dates.length > 1;
  const lastDate = dates[dates.length - 1];
  const alerts: DayAlert[] = [];

  for (const date of dates) {
    const items = groupsMap.get(date) ?? [];
    const missing: AlertType[] = [];

    if (isMultiDay && date !== lastDate) {
      const hasHotel = items.some((item) => item.eventType === "hotel");
      if (!hasHotel) missing.push("hotel");
    }

    const hasFood = items.some((item) => item.eventType === "food");
    if (!hasFood) missing.push("food");

    const hasTransport = items.some(
      (item) => item.eventType === "flight" || item.eventType === "train",
    );
    if (!hasTransport) missing.push("transport");

    if (missing.length > 0) {
      alerts.push({ date, missing });
    }
  }

  return alerts;
}
