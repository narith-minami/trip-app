/**
 * src/lib/schemas/todo.ts
 *
 * Isomorphic constants and Zod pieces for todo validation. Pure module (no UI
 * imports) so it can be shared by the Hono server routes and the React client
 * without dragging client-only dependencies across the boundary.
 */

import { z } from "zod";
import { isValidDateString } from "@/lib/utils";

/** Max characters for a single todo tag. */
export const TODO_TAG_MAX = 30;
/** Max number of tags per todo. */
export const TODO_TAGS_MAX = 10;

/** Max characters for the todo description (long-form detail). */
export const TODO_DESCRIPTION_MAX = 2000;
/** Max characters for a todo comment body. */
export const TODO_COMMENT_MAX = 1000;

/** A single tag: trimmed, non-empty, length-bounded. */
export const TodoTagSchema = z.string().trim().min(1).max(TODO_TAG_MAX);

/** An array of todo tags, capped at {@link TODO_TAGS_MAX}. */
export const TodoTagsSchema = z
  .array(TodoTagSchema)
  .max(TODO_TAGS_MAX, "タグは10個以内にしてください");

/**
 * Optional long-form description. Nullable so it can be explicitly cleared
 * (AGENTS.md #1). Empty strings are normalised to null via transform.
 */
export const TodoDescriptionSchema = z
  .string()
  .max(TODO_DESCRIPTION_MAX, "詳細は2000文字以内で入力してください")
  .transform((v) => (v.trim() === "" ? null : v))
  .nullish();

/**
 * Optional due date as YYYY-MM-DD. Nullable so it can be cleared
 * (AGENTS.md #1). Invalid calendar dates are rejected via refine
 * (AGENTS.md #10) using {@link isValidDateString}.
 */
export const TodoDueDateSchema = z
  .string()
  .refine((v) => isValidDateString(v), {
    message: "期日は YYYY-MM-DD 形式で入力してください",
  })
  .nullish();

/** A todo comment body: trimmed, non-empty, length-bounded. */
export const TodoCommentContentSchema = z
  .string()
  .trim()
  .min(1, "コメントを入力してください")
  .max(TODO_COMMENT_MAX, "コメントは1000文字以内で入力してください");
