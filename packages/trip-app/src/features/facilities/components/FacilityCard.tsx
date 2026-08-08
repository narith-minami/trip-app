/**
 * src/features/facilities/components/FacilityCard.tsx
 *
 * Row card for a single facility in the list, grouped by category.
 */

import { useNavigate } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { resolveFacilityType } from "@/lib/facilityTypes";
import type { Facility } from "@/types/entities";

export interface FacilityCardProps {
  tripId: string;
  facility: Facility;
}

export function FacilityCard({ tripId, facility }: FacilityCardProps) {
  const navigate = useNavigate();
  const type = resolveFacilityType(facility.category);
  const Icon = type.icon;

  return (
    <button
      type="button"
      onClick={() =>
        navigate({
          to: "/trips/$tripId/facilities/$facilityId",
          params: { tripId, facilityId: facility.id },
        })
      }
      className="flex w-full items-center gap-3 rounded-2xl border border-cream-dark bg-white p-3 text-left shadow-sm transition-colors hover:border-ink-muted"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${type.color}20`, color: type.color }}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{facility.name}</span>
        {facility.address && (
          <span className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-muted">
            <MapPin size={12} aria-hidden="true" className="shrink-0" />
            {facility.address}
          </span>
        )}
      </span>
    </button>
  );
}
