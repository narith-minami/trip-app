/**
 * src/mocks/api/members.ts
 *
 * Mock members API. Fetch and remove trip members.
 */

const now = Date.now();
const mockUser = { id: "user-1", name: "Dev User", email: "dev@example.com", image: null };

const mockMembers = [
  {
    tripId: "trip-1",
    userId: "user-1",
    role: "owner" as const,
    joinedAt: now - 7 * 24 * 60 * 60 * 1000,
    user: mockUser,
  },
];

let members = structuredClone(mockMembers);

export async function fetchMembers(tripId: string) {
  const filtered = members.filter((m) => m.tripId === tripId);
  return { data: filtered };
}

export async function removeMember(tripId: string, memberId: string) {
  const index = members.findIndex((m) => m.tripId === tripId && m.userId === memberId);
  if (index === -1) throw new Error(`Member ${memberId} not found in trip ${tripId}`);

  members.splice(index, 1);
  return { success: true };
}
