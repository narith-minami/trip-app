/**
 * src/api/facilities.ts
 *
 * Facility (施設・スポット) API query functions.
 */

import type { FacilityCategory } from "@/lib/facilityTypes";
import { apiClient } from "./client";

export interface FacilityInput {
  category: FacilityCategory;
  name: string;
  address?: string | null;
  phone?: string | null;
  businessHours?: string | null;
  url?: string | null;
  memo?: string | null;
}

/**
 * Fetch facilities for a trip
 */
export async function fetchFacilities(tripId: string) {
  const res = await apiClient.api.trips[":tripId"].facilities.$get({
    param: { tripId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch facilities");
  }
  return res.json();
}

/**
 * Fetch a single facility's detail
 */
export async function fetchFacility(tripId: string, facilityId: string) {
  const res = await apiClient.api.trips[":tripId"].facilities[":facilityId"].$get({
    param: { tripId, facilityId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch facility");
  }
  return res.json();
}

/**
 * Create a facility
 */
export async function createFacility(tripId: string, data: FacilityInput) {
  const res = await apiClient.api.trips[":tripId"].facilities.$post({
    param: { tripId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to create facility");
  }
  return res.json();
}

/**
 * Update a facility
 */
export async function updateFacility(
  tripId: string,
  facilityId: string,
  data: Partial<FacilityInput>
) {
  const res = await apiClient.api.trips[":tripId"].facilities[":facilityId"].$put({
    param: { tripId, facilityId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to update facility");
  }
  return res.json();
}

/**
 * Delete a facility
 */
export async function deleteFacility(tripId: string, facilityId: string) {
  const res = await apiClient.api.trips[":tripId"].facilities[":facilityId"].$delete({
    param: { tripId, facilityId },
  });
  if (!res.ok) {
    throw new Error("Failed to delete facility");
  }
  return res.json();
}
