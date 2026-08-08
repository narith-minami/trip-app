/**
 * src/api/members.ts
 *
 * Members API query functions.
 */

import { apiClient } from "./client";
import { unwrap, unwrapData } from "./unwrap";

/**
 * Fetch trip members
 */
export async function fetchMembers(tripId: string) {
  return unwrapData(
    await apiClient.api.trips[":tripId"].members.$get({
      param: { tripId },
    }),
    "Failed to fetch members"
  );
}

/**
 * Remove member from trip
 */
export async function removeMember(tripId: string, memberId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].members[":memberId"].$delete({
      param: { tripId, memberId },
    }),
    "Failed to remove member"
  );
}
