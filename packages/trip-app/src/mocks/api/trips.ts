/**
 * src/mocks/api/trips.ts
 *
 * Mock trips API. CRUD operations on in-memory mock data.
 * Note: store is imported dynamically to avoid module resolution issues.
 */

const now = Date.now();

const USER_ID = "user-1";
const DEV_USER = { id: USER_ID, name: "Dev User", email: "dev@example.com", image: null };

// In-memory mock data - matches the structure of src/types/entities.ts
const mockTrips = [
  {
    id: "trip-1",
    title: "東京旅行",
    destination: "東京",
    startDate: "2025-07-01",
    endDate: "2025-07-05",
    ownerId: USER_ID,
    inviteToken: "mock-invite-token-1",
    coverImageUrl: null,
    createdAt: now - 7 * 24 * 60 * 60 * 1000,
    updatedAt: now - 7 * 24 * 60 * 60 * 1000,
    owner: DEV_USER,
    members: [
      {
        tripId: "trip-1",
        userId: USER_ID,
        role: "owner" as const,
        joinedAt: now - 7 * 24 * 60 * 60 * 1000,
        user: DEV_USER,
      },
    ],
  },
];

const trips = structuredClone(mockTrips);

export async function fetchTrips() {
  const response = {
    data: trips,
    pagination: {
      page: 1,
      limit: 20,
      total: trips.length,
      pages: 1,
    },
  };
  return response;
}

export async function fetchTrip(tripId: string) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new Error(`Trip ${tripId} not found`);
  return trip;
}

export async function createTrip(data: {
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  description?: string;
}) {
  const newTrip = {
    id: `trip-${Date.now()}`,
    title: data.title,
    destination: data.location || "",
    startDate: data.startDate,
    endDate: data.endDate,
    ownerId: USER_ID,
    inviteToken: `invite-${Math.random().toString(36).substr(2, 9)}`,
    coverImageUrl: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    owner: DEV_USER,
    members: [
      {
        tripId: `trip-${Date.now()}`,
        userId: USER_ID,
        role: "owner" as const,
        joinedAt: Date.now(),
        user: DEV_USER,
      },
    ],
  };
  trips.push(newTrip);
  return newTrip;
}

export async function updateTrip(
  tripId: string,
  data: {
    title?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    coverImageUrl?: string | null;
  }
) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  Object.assign(trip, {
    title: data.title ?? trip.title,
    destination: data.location ?? trip.destination,
    startDate: data.startDate ?? trip.startDate,
    endDate: data.endDate ?? trip.endDate,
    coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl : trip.coverImageUrl,
    updatedAt: Date.now(),
  });

  return trip;
}

export async function deleteTrip(tripId: string) {
  const index = trips.findIndex((t) => t.id === tripId);
  if (index === -1) throw new Error(`Trip ${tripId} not found`);

  trips.splice(index, 1);
  return { success: true };
}

/**
 * Mock cover upload: reads the file as a base64 data URL (no R2 in mock
 * mode) and stores it directly on the trip, mirroring
 * `uploadScheduleItemImage` in ./schedule.ts.
 */
export async function uploadTripCover(tripId: string, file: File) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  Object.assign(trip, { coverImageUrl: dataUrl, updatedAt: Date.now() });
  return trip;
}
