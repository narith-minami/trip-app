/**
 * src/routes/trips/index.tsx
 *
 * Trips list page component.
 * Displays all user's trips with options to create, view, and manage them.
 */

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { CreateTripModal } from "@/features/trips/components/CreateTripModal";
import { TripCard, type TripCardData } from "@/features/trips/components/TripCard";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function TripsPage() {
  const navigate = useNavigate();
  const { data: tripsData, isLoading, error } = useTrips();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (isLoading) return <LoadingSpinner fullScreen label="旅行を読み込み中..." />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">旅行の読み込みに失敗しました</p>
      </div>
    );
  }

  const trips = (tripsData?.data ?? []) as TripCardData[];

  return (
    <div className="min-h-screen bg-cream">
      {/* App header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cream"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className="font-display text-xl font-semibold text-navy">Tabigo</span>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>+ 新しい旅行</Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {trips.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-6 text-ink-muted">
              旅行がまだありません。最初の旅行を作成しましょう！
            </p>
            <Button onClick={() => setShowCreateModal(true)}>最初の旅行を作成</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={() => navigate({ to: `/trips/${trip.id}` })}
              />
            ))}
          </div>
        )}
      </div>

      <CreateTripModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}

export default TripsPage;
