/**
 * src/api/trips.ts
 *
 * Trip API query functions.
 * Provides high-level functions for trip-related API calls.
 */

import { apiClient } from "./client";
import { unwrap } from "./unwrap";

/**
 * Fetch list of trips for current user
 */
export async function fetchTrips() {
  return unwrap(await apiClient.api.trips.$get(), "Failed to fetch trips");
}

/**
 * Fetch single trip details
 */
export async function fetchTrip(tripId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].$get({
      param: { tripId },
    }),
    "Failed to fetch trip"
  );
}

/**
 * Create a new trip
 */
export async function createTrip(data: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
}) {
  return unwrap(
    await apiClient.api.trips.$post({
      json: data,
    }),
    "Failed to create trip"
  );
}

/**
 * Update trip
 */
export async function updateTrip(
  tripId: string,
  data: Partial<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    coverImageUrl: string | null;
  }>
) {
  return unwrap(
    await apiClient.api.trips[":tripId"].$put({
      param: { tripId },
      json: data,
    }),
    "Failed to update trip"
  );
}

/**
 * Upload a trip's cover thumbnail image to R2.
 * Uses a raw fetch (not the RPC client) since Hono RPC has no typed
 * multipart/form-data support — same pattern as `uploadScheduleItemImage`.
 */
export async function uploadTripCover(tripId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`/api/trips/${tripId}/cover`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Failed to upload trip cover");
  }
  return res.json();
}

/**
 * Delete trip
 */
export async function deleteTrip(tripId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].$delete({
      param: { tripId },
    }),
    "Failed to delete trip"
  );
}
