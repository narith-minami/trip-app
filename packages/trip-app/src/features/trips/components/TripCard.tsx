/**
 * src/features/trips/components/TripCard.tsx
 *
 * Presentational card summarising a single trip in the trips list.
 */

import { Badge } from "@/components/ui/badge";
import { resolveCoverImageSrc } from "@/features/trips/lib/coverImage";
import { getTripStatus, type TripStatus } from "@/features/trips/lib/tripStatus";
import { cn } from "@/lib/cn";
import { parseLocalDate } from "@/lib/japaneseDate";
import { pickByHash } from "@/lib/pickByHash";
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

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) => {
    const date = parseLocalDate(d);
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function StatusBadge({ status }: { status: TripStatus }) {
  if (status.type === "ongoing") {
    return <Badge variant="sage">{status.label}</Badge>;
  }
  if (status.type === "finished") {
    return (
      <Badge variant="neutral" className="opacity-70">
        {status.label}
      </Badge>
    );
  }
  return <Badge variant="gold">{status.label}</Badge>;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const isOwner = trip.members?.some((m) => m.role === "owner");
  const hasCover = Boolean(trip.coverImageUrl);
  const status =
    trip.startDate && trip.endDate ? getTripStatus(trip.startDate, trip.endDate) : null;

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
            src={resolveCoverImageSrc(trip.coverImageUrl ?? "")}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="block h-full w-full"
            style={{ background: pickByHash(trip.id, COVER_GRADIENTS) }}
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
      <span className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs text-ink-light">
            {trip.startDate && trip.endDate ? formatDateRange(trip.startDate, trip.endDate) : ""}
          </span>
          {status && <StatusBadge status={status} />}
        </span>
        <Badge variant={isOwner ? "coral" : "neutral"}>{isOwner ? "オーナー" : "メンバー"}</Badge>
      </span>
    </button>
  );
}
