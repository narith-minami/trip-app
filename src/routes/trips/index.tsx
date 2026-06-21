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

  if (isLoading) return <LoadingSpinner fullScreen label="Loading trips..." />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading trips</p>
      </div>
    );
  }

  const trips = (tripsData?.data ?? []) as TripCardData[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <Button onClick={() => setShowCreateModal(true)}>+ New Trip</Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {trips.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-600">No trips yet. Create your first trip!</p>
            <Button onClick={() => setShowCreateModal(true)}>Create First Trip</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
