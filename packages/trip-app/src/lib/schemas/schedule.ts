/**
 * src/lib/schemas/schedule.ts
 *
 * Isomorphic Zod schemas for schedule item validation. Pure module (no UI
 * imports) shared by the Hono server routes and the React client, following
 * the same pattern as `trip.ts` / `todo.ts` / `scrap.ts`.
 */

import { z } from "zod";
import { EVENT_TYPE_KEYS } from "@/lib/eventTypeKeys";

/** Max items accepted by the bulk reorder endpoint. */
const SCHEDULE_REORDER_MAX = 100;
/** Max items accepted by the bulk copy endpoint. */
const SCHEDULE_COPY_MAX = 50;

/**
 * Schema for creating a schedule item.
 */
export const CreateScheduleItemSchema = z.object({
  date: z.iso.date(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  title: z.string().min(1),
  eventType: z.enum(EVENT_TYPE_KEYS).nullable().optional(),
  isTentative: z.boolean().optional(),
  placeName: z.string().nullable().optional(),
  placeUrl: z.url().nullable().optional(),
  memo: z.string().nullable().optional(),
  facilityId: z.string().nullable().optional(),
  orderIndex: z.number().int().default(0),
});

/**
 * Schema for updating a schedule item (all fields optional).
 */
export const UpdateScheduleItemSchema = CreateScheduleItemSchema.partial();

export type UpdateScheduleItem = z.infer<typeof UpdateScheduleItemSchema>;

/**
 * Schema for bulk-updating orderIndex of multiple items.
 */
export const ReorderScheduleItemsSchema = z.object({
  items: z
    .array(z.object({ id: z.string(), orderIndex: z.number().int().min(0) }))
    .min(1)
    .max(SCHEDULE_REORDER_MAX),
});

/**
 * Schema for bulk-copying items to a different date.
 */
export const CopyScheduleItemsSchema = z.object({
  targetDate: z.iso.date(),
  itemIds: z.array(z.string()).min(1).max(SCHEDULE_COPY_MAX),
});
