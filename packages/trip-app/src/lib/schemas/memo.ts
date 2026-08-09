/**
 * src/lib/schemas/memo.ts
 *
 * Isomorphic Zod schema for trip memo (sticky note) validation. Pure module
 * shared by the Hono server routes and the React client, following the same
 * pattern as `trip.ts` / `todo.ts` / `scrap.ts`.
 */

import { z } from "zod";

/** Max characters for a memo's body text. */
export const MEMO_CONTENT_MAX = 5000;

/**
 * Schema for creating or updating a memo. Used for both operations since
 * `content` is the only editable field.
 */
export const MemoSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "メモ内容を入力してください")
    .max(MEMO_CONTENT_MAX, "メモは5000文字以内で入力してください"),
});
