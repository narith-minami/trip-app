/**
 * src/routes/trips/$tripId/index.tsx
 *
 * Trip detail page component.
 * Displays trip information with tabs for schedule, todos, memo, and members.
 */

import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { TripHeader } from "@/features/trips/components/TripHeader";
import { useTripColors } from "@/features/trips/hooks/useTripColors";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useTripEditor } from "@/features/trips/hooks/useTripEditor";
import type { TripMember } from "@/types/entities";
import { TripTabsContent } from "./TripTabsContent";

const TRIP_TABS = [
  { value: "schedule", label: "日程" },
  { value: "todos", label: "Todo" },
  { value: "memo", label: "メモ" },
  { value: "members", label: "メンバー" },
];

export function TripDetailPage() {
  const { tripId } = useParams({ from: "/trips/$tripId/" });
  const navigate = useNavigate();
  const { data: trip, isLoading, error } = useTripDetail(tripId);
  const [activeTab, setActiveTab] = useState("schedule");
  const editor = useTripEditor(tripId);
  const { backgroundColor, headerColor, setColors, reset } = useTripColors(tripId);

  if (isLoading) return <LoadingSpinner fullScreen label="旅行を読み込み中..." />;

  if (error || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">旅行の読み込みに失敗しました</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate({ to: "/trips" })}>
            旅行一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = trip.ownerId === trip.owner?.id;

  return (
    <div
      className={backgroundColor ? "min-h-screen" : "min-h-screen bg-cream"}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <TripHeader
        trip={trip}
        isOwner={isOwner}
        editor={editor}
        members={trip.members as TripMember[] | undefined}
        onBack={() => navigate({ to: "/trips" })}
        headerColor={headerColor}
        colorControls={{ backgroundColor, onSave: setColors, onReset: reset }}
      />

      {/* Tab bar on white band */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4">
          <Tabs items={TRIP_TABS} value={activeTab} onValueChange={setActiveTab} />
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <TripTabsContent tripId={tripId} trip={trip} isOwner={isOwner} activeTab={activeTab} />
      </div>
    </div>
  );
}
