/**
 * src/routes/trips/$tripId/all-schedule.tsx
 *
 * Read-only view of every schedule item across the trip's full date range.
 * Navigated to from the Schedule tab via the "すべての予定を見る" button.
 */

import { useNavigate, useParams } from "@tanstack/react-router";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ScheduleFullList } from "@/features/schedule/components/ScheduleFullList";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";

export function AllSchedulePage() {
  const { tripId } = useParams({ from: "/trips/$tripId/all-schedule" });
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTripDetail(tripId);

  const handleBack = () => navigate({ to: "/trips/$tripId/", params: { tripId } });

  if (isLoading) return <LoadingSpinner fullScreen label="旅行を読み込み中..." />;

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button type="button" onClick={handleBack} className="text-sm font-medium text-ink-muted">
          ← 戻る
        </button>
        <h1 className="font-bold text-ink">すべての予定</h1>
        <span className="w-10" />
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {trip && (
          <ScheduleFullList tripId={tripId} startDate={trip.startDate} endDate={trip.endDate} />
        )}
      </div>
    </div>
  );
}
