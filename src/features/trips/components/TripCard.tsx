/**
 * src/features/trips/components/TripCard.tsx
 *
 * Presentational card summarising a single trip in the trips list.
 */

import type { Trip, TripMemberRole } from "@/types/entities";

export interface TripCardData extends Trip {
  members?: { role: TripMemberRole }[] | null;
}

export interface TripCardProps {
  trip: TripCardData;
  onClick: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const isOwner = trip.members?.some((m) => m.role === "owner");

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full overflow-hidden rounded-lg bg-white text-left shadow transition hover:shadow-lg"
    >
      {trip.coverImageUrl && (
        <span className="block h-48 w-full bg-gray-200">
          <img src={trip.coverImageUrl} alt={trip.title} className="h-full w-full object-cover" />
        </span>
      )}
      <span className="block p-4">
        <span className="mb-2 block text-xl font-semibold text-gray-900">{trip.title}</span>
        {trip.destination && <span className="mb-2 block text-gray-600">{trip.destination}</span>}
        <span className="mb-4 block text-sm text-gray-500">
          {trip.startDate} to {trip.endDate}
        </span>
        <span className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{trip.members?.length ?? 0} members</span>
          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
            {isOwner ? "Owner" : "Member"}
          </span>
        </span>
      </span>
    </button>
  );
}
