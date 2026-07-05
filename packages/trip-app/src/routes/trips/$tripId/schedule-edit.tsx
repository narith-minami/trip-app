/**
 * src/routes/trips/$tripId/schedule-edit.tsx
 *
 * Calendar edit page for a trip's schedule.
 * Navigated to from the Schedule tab via the "カレンダー編集" button.
 */

import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ScheduleCalendarView } from "@/features/schedule/components/ScheduleCalendarView";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";

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

export function ScheduleEditPage() {
  const { tripId } = useParams({ from: "/trips/$tripId/schedule-edit" });
  const { date } = useSearch({ from: "/trips/$tripId/schedule-edit" });
  const navigate = useNavigate();

  const { data: trip } = useTripDetail(tripId);
  const dates =
    trip?.startDate && trip?.endDate ? generateDateRange(trip.startDate, trip.endDate) : [];

  const initialDate = date || dates[0] || "";

  const handleBack = () => navigate({ to: "/trips/$tripId/", params: { tripId } });

  return (
    <ScheduleCalendarView tripId={tripId} date={initialDate} dates={dates} onBack={handleBack} />
  );
}

export default ScheduleEditPage;
