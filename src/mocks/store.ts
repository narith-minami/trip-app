/**
 * src/mocks/store.ts
 *
 * In-memory mutable store initialized from seed data.
 * Resets on page reload.
 */

import { MOCK_TRIPS, MOCK_SCHEDULE_ITEMS, MOCK_TODOS, MOCK_MEMO, MOCK_MEMBERS } from "./seed";

export const store = {
  trips: structuredClone(MOCK_TRIPS),
  scheduleItems: structuredClone(MOCK_SCHEDULE_ITEMS),
  todos: structuredClone(MOCK_TODOS),
  memo: structuredClone(MOCK_MEMO),
  members: structuredClone(MOCK_MEMBERS),
};
