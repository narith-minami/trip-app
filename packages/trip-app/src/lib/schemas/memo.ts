/**
 * src/lib/schemas/memo.ts
 *
 * Isomorphic Zod schema for trip memo validation. Pure module shared by the
 * Hono server routes and the React client, following the same pattern as
 * `trip.ts` / `todo.ts` / `scrap.ts`.
 */

import { z } from "zod";

/**
 * Schema for updating the trip memo.
 */
export const MemoSchema = z.object({
  content: z.string(),
});
