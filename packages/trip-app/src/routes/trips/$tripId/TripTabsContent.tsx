/**
 * src/routes/trips/$tripId/TripTabsContent.tsx
 *
 * Renders the active tab's content for the trip detail page.
 * Lives alongside the route (not in a feature) so it can compose
 * sections from multiple features.
 */

import { FacilitySection } from "@/features/facilities/components/FacilitySection";
import { useFacilities } from "@/features/facilities/hooks/useFacilities";
import { MembersSection } from "@/features/members/components/MembersSection";
import { MemoSection } from "@/features/memo/components/MemoSection";
import { ScheduleSection } from "@/features/schedule/components/ScheduleSection";
import { TodosSection } from "@/features/todos/components/TodosSection";
import type { useTripDetail } from "@/features/trips/hooks/useTripDetail";

type TripDetail = NonNullable<ReturnType<typeof useTripDetail>["data"]>;

export interface TripTabsContentProps {
  tripId: string;
  trip: TripDetail;
  isOwner: boolean;
  activeTab: string;
}

export function TripTabsContent({ tripId, trip, isOwner, activeTab }: TripTabsContentProps) {
  // Fetched here (not inside the schedule feature) so ScheduleItemForm's
  // facility selector can use it without a cross-feature import.
  const { data: facilities } = useFacilities(tripId);

  return (
    <>
      {activeTab === "schedule" && (
        <ScheduleSection
          tripId={tripId}
          facilities={facilities ?? []}
          canEdit
          defaultDate={trip.startDate}
          startDate={trip.startDate}
          endDate={trip.endDate}
        />
      )}
      {activeTab === "facilities" && <FacilitySection tripId={tripId} canEdit />}
      {activeTab === "todos" && <TodosSection tripId={tripId} members={trip.members} />}
      {activeTab === "memo" && <MemoSection tripId={tripId} />}
      {activeTab === "members" && (
        <MembersSection tripId={tripId} inviteToken={trip.inviteToken} canManage={isOwner} />
      )}
    </>
  );
}
