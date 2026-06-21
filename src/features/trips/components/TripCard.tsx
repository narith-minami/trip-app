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
      className="w-full overflow-hidden rounded-lg bg-white text-left shadow transition hover:shadow-lg"
    >
      {trip.coverImageUrl && (
        <div className="h-48 w-full bg-gray-200">
          <img src={trip.coverImageUrl} alt={trip.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">{trip.title}</h2>
        {trip.destination && <p className="mb-2 text-gray-600">{trip.destination}</p>}
        <p className="mb-4 text-sm text-gray-500">
          {trip.startDate} to {trip.endDate}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{trip.members?.length ?? 0} members</div>
          <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
            {isOwner ? "Owner" : "Member"}
          </span>
        </div>
      </div>
    </button>
  );
}
