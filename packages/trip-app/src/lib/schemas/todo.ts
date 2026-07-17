/**
 * src/lib/schemas/todo.ts
 *
 * Isomorphic constants and Zod pieces for todo validation. Pure module (no UI
 * imports) so it can be shared by the Hono server routes and the React client
 * without dragging client-only dependencies across the boundary.
 */

import { z } from "zod";

/** Max characters for a single todo tag. */
export const TODO_TAG_MAX = 30;
/** Max number of tags per todo. */
export const TODO_TAGS_MAX = 10;

/** A single tag: trimmed, non-empty, length-bounded. */
export const TodoTagSchema = z.string().trim().min(1).max(TODO_TAG_MAX);

/** An array of todo tags, capped at {@link TODO_TAGS_MAX}. */
export const TodoTagsSchema = z
  .array(TodoTagSchema)
  .max(TODO_TAGS_MAX, "タグは10個以内にしてください");
