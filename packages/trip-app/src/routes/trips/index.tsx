/**
 * src/routes/trips/index.tsx
 *
 * Trips list page component.
 * Displays all user's trips with options to create, view, and manage them.
 */

import { useNavigate } from "@tanstack/react-router";
import { Home, Plus } from "lucide-react";
import { useState } from "react";
import { QueryBoundary } from "@/components/feedback/QueryBoundary";
import { AppShell, PageContainer } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { CreateTripModal } from "@/features/trips/components/CreateTripModal";
import { TripCard, type TripCardData } from "@/features/trips/components/TripCard";
import { useTrips } from "@/features/trips/hooks/useTrips";

function TripsHeader({
  onCreate,
  onOpenScraps,
}: {
  onCreate: () => void;
  onOpenScraps: () => void;
}) {
  return (
    <div className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy">
            <Home size={16} className="text-cream" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-semibold text-navy">Tabigo</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="whitespace-nowrap"
            onClick={onOpenScraps}
          >
            スクラップ
          </Button>
          <Button size="sm" className="whitespace-nowrap" onClick={onCreate}>
            <span className="inline-flex items-center gap-1">
              <Plus size={16} aria-hidden="true" />
              新しい旅行
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TripsPage() {
  const navigate = useNavigate();
  const { data: tripsData, isLoading, error } = useTrips();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const trips = (tripsData?.data ?? []) as TripCardData[];

  return (
    <QueryBoundary
      isLoading={isLoading}
      error={error}
      fullScreen
      loadingLabel="旅行を読み込み中..."
      errorMessage="旅行の読み込みに失敗しました"
    >
      <AppShell>
        <TripsHeader
          onCreate={() => setShowCreateModal(true)}
          onOpenScraps={() => navigate({ to: "/scraps" })}
        />
        <PageContainer className="!py-8">
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
        </PageContainer>
        <CreateTripModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
      </AppShell>
    </QueryBoundary>
  );
}
