/**
 * src/server/constants.ts
 *
 * Shared HTTP error messages used by the API route handlers.
 * Centralising them keeps the messages consistent and avoids duplicating
 * the same string literals across route files.
 */

export const HTTP_ERRORS = {
  INTERNAL: "Internal server error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  TRIP_ID_REQUIRED: "Trip ID is required",
} as const;
