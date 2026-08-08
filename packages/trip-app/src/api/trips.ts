/**
 * src/api/trips.ts
 *
 * Trip API query functions.
 * Provides high-level functions for trip-related API calls.
 */

import { apiClient } from "./client";

/**
 * Fetch list of trips for current user
 */
export async function fetchTrips() {
  const res = await apiClient.api.trips.$get();
  if (!res.ok) {
    throw new Error("Failed to fetch trips");
  }
  return res.json();
}

/**
 * Fetch single trip details
 */
export async function fetchTrip(tripId: string) {
  const res = await apiClient.api.trips[":tripId"].$get({
    param: { tripId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch trip");
  }
  return res.json();
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
  const res = await apiClient.api.trips.$post({
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to create trip");
  }
  return res.json();
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
  const res = await apiClient.api.trips[":tripId"].$put({
    param: { tripId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to update trip");
  }
  return res.json();
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
  const res = await apiClient.api.trips[":tripId"].$delete({
    param: { tripId },
  });
  if (!res.ok) {
    throw new Error("Failed to delete trip");
  }
  return res.json();
}
