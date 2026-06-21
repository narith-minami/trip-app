/**
 * src/routes/trips/$tripId/index.tsx
 *
 * Trip detail page component.
 * Displays trip information with tabs for schedule, todos, memo, and members.
 */

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { TripHeader } from "@/features/trips/components/TripHeader";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useTripEditor } from "@/features/trips/hooks/useTripEditor";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { TripTabsContent } from "./TripTabsContent";

const TRIP_TABS = [
  { value: "schedule", label: "Schedule" },
  { value: "todos", label: "Todos" },
  { value: "memo", label: "Memo" },
  { value: "members", label: "Members" },
];

export function TripDetailPage() {
  const { tripId } = useParams({ from: "/trips/$tripId/" });
  const navigate = useNavigate();
  const { data: trip, isLoading, error } = useTripDetail(tripId);
  const [activeTab, setActiveTab] = useState("schedule");
  const editor = useTripEditor(tripId);

  if (isLoading) return <LoadingSpinner fullScreen label="Loading trip..." />;

  if (error || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading trip</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate({ to: "/trips" })}>
            Back to Trips
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = trip.ownerId === trip.owner?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <TripHeader
        trip={trip}
        isOwner={isOwner}
        editor={editor}
        onBack={() => navigate({ to: "/trips" })}
      />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Tabs items={TRIP_TABS} value={activeTab} onValueChange={setActiveTab} />
        <div className="mt-6">
          <TripTabsContent tripId={tripId} trip={trip} isOwner={isOwner} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default TripDetailPage;
