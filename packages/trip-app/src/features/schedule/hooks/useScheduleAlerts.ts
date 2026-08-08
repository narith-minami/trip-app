import { useMemo } from "react";
import type { ScheduleItem } from "@/types/entities";

export type AlertType = "hotel" | "food" | "transport";

export interface DayAlert {
  date: string;
  missing: AlertType[];
}

function hasEvent(items: ScheduleItem[], types: string[]): boolean {
  return items.some((item) => types.includes(item.eventType ?? ""));
}

function findMissingAlerts(
  items: ScheduleItem[],
  isMultiDay: boolean,
  isLastDate: boolean
): AlertType[] {
  const missing: AlertType[] = [];

  if (isMultiDay && !isLastDate && !hasEvent(items, ["hotel"])) {
    missing.push("hotel");
  }
  if (!hasEvent(items, ["food"])) {
    missing.push("food");
  }
  if (!hasEvent(items, ["flight", "train"])) {
    missing.push("transport");
  }

  return missing;
}

function computeScheduleAlerts(
  groupsMap: Map<string, ScheduleItem[]>,
  dates: string[]
): DayAlert[] {
  if (dates.length === 0) return [];
  const isMultiDay = dates.length > 1;
  const lastDate = dates[dates.length - 1];
  const alerts: DayAlert[] = [];

  for (const date of dates) {
    const items = groupsMap.get(date) ?? [];
    const missing = findMissingAlerts(items, isMultiDay, date === lastDate);
    if (missing.length > 0) {
      alerts.push({ date, missing });
    }
  }

  return alerts;
}

export function useScheduleAlertsData(
  groupsMap: Map<string, ScheduleItem[]>,
  dates: string[],
  selectedDate: string
) {
  const alerts = useMemo(() => computeScheduleAlerts(groupsMap, dates), [groupsMap, dates]);
  const alertCountByDate = useMemo(
    () => new Map(alerts.map((a) => [a.date, a.missing.length])),
    [alerts]
  );
  const selectedMissing = useMemo(
    () => alerts.find((a) => a.date === selectedDate)?.missing ?? [],
    [alerts, selectedDate]
  );
  return { alertCountByDate, selectedMissing };
}
