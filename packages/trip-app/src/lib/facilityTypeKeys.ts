/**
 * src/lib/facilityTypeKeys.ts
 *
 * Facility category keys. Pure module (no icon/UI imports) so it can be
 * shared by the Hono server routes (Zod enum) and the React client — the UI
 * metadata in `facilityTypes.ts` is constrained to exactly these keys, so the
 * server enum and client list can never drift apart.
 */

/** Facility category keys, kept as a readonly tuple for `z.enum(...)`. */
export const FACILITY_CATEGORY_KEYS = [
  "hotel",
  "restaurant",
  "sightseeing",
  "shopping",
  "transport",
  "other",
] as const;

export type FacilityCategory = (typeof FACILITY_CATEGORY_KEYS)[number];
