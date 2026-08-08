/**
 * src/mocks/api/facilities.ts
 *
 * Mock facilities API. CRUD operations on trip facilities.
 */

import type { Facility } from "@/types/entities";
import type { FacilityInput } from "../../api/facilities";

const now = Date.now();

const mockFacilities: Facility[] = [
  {
    id: "facility-1",
    tripId: "trip-1",
    category: "hotel",
    name: "グランドホテル東京",
    address: "東京都港区海岸1-1-1",
    phone: "03-1234-5678",
    businessHours: "チェックイン 15:00 / チェックアウト 11:00",
    url: "https://example.com/grand-hotel-tokyo",
    memo: "駅から徒歩5分",
    updatedBy: null,
    createdAt: now - 5 * 24 * 60 * 60 * 1000,
    updatedAt: now - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "facility-2",
    tripId: "trip-1",
    category: "restaurant",
    name: "すし処 みなと",
    address: "東京都渋谷区道玄坂2-2-2",
    phone: "03-2345-6789",
    businessHours: "11:30-14:00, 17:00-22:00（水曜定休）",
    url: null,
    memo: "要予約",
    updatedBy: null,
    createdAt: now - 4 * 24 * 60 * 60 * 1000,
    updatedAt: now - 4 * 24 * 60 * 60 * 1000,
  },
];

export const facilities = structuredClone(mockFacilities);

export async function fetchFacilities(tripId: string) {
  const items = facilities
    .filter((f) => f.tripId === tripId)
    .sort((a, b) => a.category.localeCompare(b.category) || a.createdAt - b.createdAt);

  return { data: items };
}

export async function fetchFacility(tripId: string, facilityId: string) {
  const facility = facilities.find((f) => f.id === facilityId && f.tripId === tripId);
  if (!facility) throw new Error(`Facility ${facilityId} not found`);
  return facility;
}

export async function createFacility(tripId: string, data: FacilityInput) {
  const newFacility: Facility = {
    id: `facility-${Date.now()}`,
    tripId,
    category: data.category,
    name: data.name,
    address: data.address ?? null,
    phone: data.phone ?? null,
    businessHours: data.businessHours ?? null,
    url: data.url ?? null,
    memo: data.memo ?? null,
    updatedBy: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  facilities.push(newFacility);
  return newFacility;
}

export async function updateFacility(
  tripId: string,
  facilityId: string,
  data: Partial<FacilityInput>
) {
  const facility = facilities.find((f) => f.id === facilityId && f.tripId === tripId);
  if (!facility) throw new Error(`Facility ${facilityId} not found`);

  Object.assign(facility, data, { updatedAt: Date.now() });
  return facility;
}

export async function deleteFacility(tripId: string, facilityId: string) {
  const index = facilities.findIndex((f) => f.id === facilityId && f.tripId === tripId);
  if (index === -1) throw new Error(`Facility ${facilityId} not found`);

  facilities.splice(index, 1);
  return { success: true };
}
