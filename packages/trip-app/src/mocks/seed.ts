/**
 * src/mocks/seed.ts
 *
 * Static mock seed data for development.
 * All data shapes conform to src/types/entities.ts and server response shapes.
 */

import type { UserSummary } from "@/types/entities";

const now = Date.now();

export const MOCK_USER: UserSummary = {
  id: "user-1",
  name: "Dev User",
  email: "dev@example.com",
  image: null,
};

export const MOCK_SESSION = {
  id: "session-1",
  userId: "user-1",
  expiresAt: new Date(now + 24 * 60 * 60 * 1000),
  createdAt: new Date(now),
  updatedAt: new Date(now),
};
