/**
 * src/features/trips/components/TripCard.tsx
 *
 * Presentational card summarising a single trip in the trips list.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Trip, TripMemberRole } from "@/types/entities";

export interface TripCardData extends Trip {
  members?: { role: TripMemberRole }[] | null;
}

export interface TripCardProps {
  trip: TripCardData;
  onClick: () => void;
}

const COVER_GRADIENTS = [
  "linear-gradient(160deg, #006994 0%, #00A878 50%, #7EC8E3 100%)",
  "linear-gradient(160deg, #FF6B47 0%, #D4A854 60%, #FF8F72 100%)",
  "linear-gradient(160deg, #5B8A6F 0%, #1A2E48 60%, #243D5C 100%)",
] as const;

function coverGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const isOwner = trip.members?.some((m) => m.role === "owner");
  const hasCover = Boolean(trip.coverImageUrl);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm",
        "transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] motion-reduce:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      )}
    >
      {/* Cover area */}
      <span className="relative block h-44 w-full">
        {hasCover ? (
          <img
            src={trip.coverImageUrl ?? ""}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="block h-full w-full"
            style={{ background: coverGradient(trip.id) }}
            aria-hidden="true"
          />
        )}
        {/* Gradient overlay with title */}
        <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy/75 to-transparent p-4">
          <span className="font-display text-lg font-semibold leading-tight text-white">
            {trip.title}
          </span>
          {trip.destination && (
            <span className="mt-0.5 text-xs text-white/70">{trip.destination}</span>
          )}
        </span>
      </span>

      {/* Body */}
      <span className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-ink-light">
          {trip.startDate && trip.endDate ? formatDateRange(trip.startDate, trip.endDate) : ""}
        </span>
        <Badge variant={isOwner ? "coral" : "neutral"}>{isOwner ? "オーナー" : "メンバー"}</Badge>
      </span>
    </button>
  );
}
