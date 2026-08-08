/**
 * src/features/facilities/components/FacilityDetail.tsx
 *
 * Detail panel for a single facility: category, name, address, phone,
 * business hours, URL and memo, with edit/delete actions.
 */

import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useFacilityDetailEdit } from "@/features/facilities/hooks/useFacilityDetailEdit";
import { resolveFacilityType } from "@/lib/facilityTypes";
import type { Facility } from "@/types/entities";
import { FacilityFormDialog } from "./FacilityFormDialog";

export interface FacilityDetailProps {
  tripId: string;
  facility: Facility;
  canEdit?: boolean;
  onDeleted: () => void;
}

function FacilityInfoRows({ facility }: { facility: Facility }) {
  const hasInfo = facility.address || facility.phone || facility.businessHours || facility.url;

  return (
    <div className="space-y-3 border-t border-cream-dark pt-3 text-sm">
      {facility.address && (
        <div className="flex items-start gap-2 text-ink">
          <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-light" />
          <span>{facility.address}</span>
        </div>
      )}
      {facility.phone && (
        <div className="flex items-center gap-2 text-ink">
          <Phone size={16} aria-hidden="true" className="shrink-0 text-ink-light" />
          <a href={`tel:${facility.phone}`} className="text-coral">
            {facility.phone}
          </a>
        </div>
      )}
      {facility.businessHours && (
        <div className="flex items-start gap-2 text-ink">
          <Clock size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-light" />
          <span className="whitespace-pre-wrap">{facility.businessHours}</span>
        </div>
      )}
      {facility.url && (
        <div className="flex items-center gap-2 text-ink">
          <ExternalLink size={16} aria-hidden="true" className="shrink-0 text-ink-light" />
          <a href={facility.url} target="_blank" rel="noreferrer" className="truncate text-coral">
            {facility.url}
          </a>
        </div>
      )}
      {!hasInfo && <p className="text-ink-light">基本情報は登録されていません</p>}
    </div>
  );
}

export function FacilityDetail({
  tripId,
  facility,
  canEdit = false,
  onDeleted,
}: FacilityDetailProps) {
  const { isEditOpen, openEdit, closeEdit, handleSubmit, handleDelete, isSubmitting } =
    useFacilityDetailEdit(tripId, facility, onDeleted);
  const type = resolveFacilityType(facility.category);
  const Icon = type.icon;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Badge
                variant="custom"
                className="mb-2"
                style={{ backgroundColor: `${type.color}20`, color: type.color }}
              >
                <Icon size={12} aria-hidden="true" />
                {type.label}
              </Badge>
              <h1 className="text-xl font-bold text-ink">{facility.name}</h1>
            </div>
            {canEdit && (
              <div className="flex shrink-0 gap-1">
                <Button size="sm" variant="ghost" onClick={openEdit}>
                  編集
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDelete}>
                  削除
                </Button>
              </div>
            )}
          </div>

          <FacilityInfoRows facility={facility} />

          {facility.memo && (
            <div className="rounded-xl bg-cream px-3 py-2 text-sm text-ink-muted">
              {facility.memo}
            </div>
          )}
        </CardBody>
      </Card>

      <FacilityFormDialog
        isOpen={isEditOpen}
        editing={facility}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={closeEdit}
      />
    </div>
  );
}
