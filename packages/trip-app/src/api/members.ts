/**
 * src/api/members.ts
 *
 * Members API query functions.
 */

import { apiClient } from "./client";

/**
 * Fetch trip members
 */
export async function fetchMembers(tripId: string) {
  const res = await apiClient.api.trips[":tripId"].members.$get({
    param: { tripId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch members");
  }
  return res.json();
}

/**
 * Remove member from trip
 */
export async function removeMember(tripId: string, memberId: string) {
  const res = await apiClient.api.trips[":tripId"].members[":memberId"].$delete({
    param: { tripId, memberId },
  });
  if (!res.ok) {
    throw new Error("Failed to remove member");
  }
  return res.json();
}
