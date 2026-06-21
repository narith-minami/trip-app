/**
 * src/routes/trips/$tripId/TripTabsContent.tsx
 *
 * Renders the active tab's content for the trip detail page.
 * Lives alongside the route (not in a feature) so it can compose
 * sections from multiple features.
 */

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
  return (
    <>
      {activeTab === "schedule" && (
        <ScheduleSection tripId={tripId} canEdit defaultDate={trip.startDate} />
      )}
      {activeTab === "todos" && <TodosSection tripId={tripId} members={trip.members} />}
      {activeTab === "memo" && <MemoSection tripId={tripId} />}
      {activeTab === "members" && (
        <MembersSection tripId={tripId} inviteToken={trip.inviteToken} canManage={isOwner} />
      )}
    </>
  );
}
