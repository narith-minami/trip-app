/**
 * src/lib/eventTypeKeys.ts
 *
 * Schedule event type keys. Pure module (no icon/UI imports) so it can be
 * shared by the Hono server routes (Zod enum) and the React client — the UI
 * metadata in `eventTypes.ts` is constrained to exactly these keys, so the
 * server enum and client list can never drift apart.
 */

/** Event type keys, kept as a readonly tuple for `z.enum(...)`. */
export const EVENT_TYPE_KEYS = [
  "food",
  "flight",
  "train",
  "sightseeing",
  "activity",
  "hotel",
  "shopping",
  "other",
] as const;

export type EventType = (typeof EVENT_TYPE_KEYS)[number];
