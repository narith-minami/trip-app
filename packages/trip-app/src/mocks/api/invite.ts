/**
 * src/mocks/api/invite.ts
 *
 * Mock invite API. Preview and join a trip by its seeded invite token.
 */

const MOCK_TRIP_ID = "trip-1";
const MOCK_TOKEN = "mock-invite-token-1";

const mockPreview = {
  tripId: MOCK_TRIP_ID,
  title: "東京旅行",
  destination: "東京",
  startDate: "2025-07-01",
  endDate: "2025-07-05",
  memberCount: 1,
};

export async function fetchInvitePreview(token: string) {
  if (token !== MOCK_TOKEN) {
    throw new Error("招待リンクが無効です");
  }
  return mockPreview;
}

export async function joinTripByInvite(token: string) {
  if (token !== MOCK_TOKEN) {
    throw new Error("招待リンクが無効です");
  }
  return { tripId: MOCK_TRIP_ID };
}
