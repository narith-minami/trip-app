/**
 * src/features/facilities/components/FacilitySection.tsx
 *
 * Facilities tab: facility list grouped by category, with add/edit dialog.
 */

import { Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useFacilitySection } from "@/features/facilities/hooks/useFacilitySection";
import { FACILITY_TYPE_LIST } from "@/lib/facilityTypes";
import type { Facility } from "@/types/entities";
import { FacilityCard } from "./FacilityCard";
import { FacilityFormDialog } from "./FacilityFormDialog";

export interface FacilitySectionProps {
  tripId: string;
  canEdit?: boolean;
}

function groupByCategory(facilities: Facility[]): Map<string, Facility[]> {
  const groups = new Map<string, Facility[]>();
  for (const facility of facilities) {
    const bucket = groups.get(facility.category);
    if (bucket) {
      bucket.push(facility);
    } else {
      groups.set(facility.category, [facility]);
    }
  }
  return groups;
}

export function FacilitySection({ tripId, canEdit = false }: FacilitySectionProps) {
  const sec = useFacilitySection(tripId);

  if (sec.isLoading) return <LoadingSpinner label="施設を読み込み中..." />;
  if (sec.error) return <p className="text-red-600">施設の読み込みに失敗しました。</p>;

  const groups = groupByCategory(sec.facilities);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-navy">施設・スポット</h3>
        {canEdit && (
          <Button size="sm" onClick={sec.openCreate}>
            <span className="inline-flex items-center gap-1">
              <Plus size={16} aria-hidden="true" />
              追加
            </span>
          </Button>
        )}
      </div>

      {sec.facilities.length === 0 ? (
        <EmptyState
          title="施設・スポットがまだありません"
          description="ホテルや飲食店などの情報を登録しておくと、予定から選んで紐付けられます。"
        />
      ) : (
        <div className="space-y-6">
          {FACILITY_TYPE_LIST.filter(({ key }) => groups.has(key)).map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <h4 className="text-sm font-semibold text-ink-muted">{label}</h4>
              <div className="space-y-2">
                {(groups.get(key) ?? []).map((facility) => (
                  <FacilityCard key={facility.id} tripId={tripId} facility={facility} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <FacilityFormDialog
        isOpen={sec.isOpen}
        editing={sec.editing}
        isSubmitting={sec.isSubmitting}
        onSubmit={sec.handleSubmit}
        onClose={sec.close}
      />
    </div>
  );
}
