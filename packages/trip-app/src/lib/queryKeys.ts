/**
 * src/lib/queryKeys.ts
 *
 * TanStack Query key factory for consistent cache key generation.
 * Follows the recommended key factory pattern for managing query cache.
 *
 * @see https://tanstack.com/query/latest/docs/react/important-defaults#recommended-key-factory
 */

const queryKeys = {
  /**
   * Trip-related queries
   */
  trips: {
    all: () => ["trips"] as const,
    list: () => [...queryKeys.trips.all(), "list"] as const,
    detail: (tripId: string) => [...queryKeys.trips.all(), tripId] as const,
    byInviteToken: (token: string) => [...queryKeys.trips.all(), "invite", token] as const,
  },

  /**
   * Trip schedule queries
   */
  schedule: {
    all: (tripId: string) => ["schedule", tripId] as const,
    list: (tripId: string) => [...queryKeys.schedule.all(tripId), "list"] as const,
  },

  /**
   * Trip facilities queries
   */
  facilities: {
    all: (tripId: string) => ["facilities", tripId] as const,
    list: (tripId: string) => [...queryKeys.facilities.all(tripId), "list"] as const,
    detail: (tripId: string, facilityId: string) =>
      [...queryKeys.facilities.all(tripId), "detail", facilityId] as const,
  },

  /**
   * Trip todos queries
   */
  todos: {
    all: (tripId: string) => ["todos", tripId] as const,
    list: (tripId: string) => [...queryKeys.todos.all(tripId), "list"] as const,
    detail: (tripId: string, todoId: string) =>
      [...queryKeys.todos.all(tripId), "detail", todoId] as const,
  },

  /**
   * Trip memos queries
   */
  memo: {
    all: (tripId: string) => ["memo", tripId] as const,
    list: (tripId: string) => [...queryKeys.memo.all(tripId), "list"] as const,
  },

  /**
   * Trip members queries
   */
  members: {
    all: (tripId: string) => ["members", tripId] as const,
    list: (tripId: string) => [...queryKeys.members.all(tripId), "list"] as const,
  },

  /**
   * Scrap (standalone memo) queries
   */
  scraps: {
    all: () => ["scraps"] as const,
    list: () => [...queryKeys.scraps.all(), "list"] as const,
  },

  /**
   * Authentication and user queries
   */
  auth: {
    user: () => ["auth", "user"] as const,
  },
} as const;

/**
 * Uppercase alias kept for call sites that import `QUERY_KEYS`.
 * Both names point at the same factory object.
 */
export const QUERY_KEYS = queryKeys;
