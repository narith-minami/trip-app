/**
 * src/routes/trips/$tripId/itinerary.tsx
 *
 * Read-only itinerary viewer page: displays the full trip schedule across
 * all days in a single scrollable view. No edit controls.
 */

import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ItineraryView } from "@/features/schedule/components/ItineraryView";
import { useTripColors } from "@/features/trips/hooks/useTripColors";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { generateDateRange } from "@/lib/utils";

export function ItineraryPage() {
  const { tripId } = useParams({ from: "/trips/$tripId/itinerary" });
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTripDetail(tripId);
  const { backgroundColor } = useTripColors(tripId);

  const handleBack = () => navigate({ to: "/trips/$tripId", params: { tripId } });

  const dates =
    trip?.startDate && trip?.endDate ? generateDateRange(trip.startDate, trip.endDate) : [];

  return (
    <AppShell style={backgroundColor ? { backgroundColor } : undefined}>
      <main className="mx-auto max-w-4xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">旅程</h1>
          <Button variant="ghost" onClick={handleBack} aria-label="旅行詳細に戻る">
            <span className="inline-flex items-center gap-1">
              <ChevronLeft size={16} aria-hidden="true" />
              戻る
            </span>
          </Button>
        </div>
        {isLoading || dates.length === 0 ? null : <ItineraryView tripId={tripId} dates={dates} />}
      </main>
    </AppShell>
  );
}
