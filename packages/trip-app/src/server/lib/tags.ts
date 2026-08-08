/**
 * src/server/lib/tags.ts
 *
 * Shared helpers for the free-form tag pattern used by todos (`todo_tags`)
 * and scraps (`scrap_tags`): deduplicate incoming tags, bulk-insert them in
 * one statement (AGENTS.md #8), and flatten the join rows back into a plain
 * `string[]` for the client.
 */

import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Database } from "../db";

/**
 * Deduplicate incoming tags (already trimmed/validated by Zod).
 */
export function uniqueTags(tags: string[] | undefined): string[] {
  return [...new Set(tags ?? [])];
}

/**
 * Build the bulk tag-insert statement, or null when there are no tags.
 * The caller provides `buildRow` to map a tag onto the table's columns
 * (e.g. `(tag) => ({ todoId, tag })`).
 */
export function insertTagsStmt<T extends SQLiteTable>(
  db: Database,
  table: T,
  tags: string[],
  buildRow: (tag: string) => T["$inferInsert"]
) {
  if (tags.length === 0) return null;
  return db.insert(table).values(tags.map(buildRow));
}

/**
 * Flatten a row's `tags` join records into a plain string[].
 */
export function flattenTags<T extends { tags: { tag: string }[] }>(
  row: T
): Omit<T, "tags"> & { tags: string[] } {
  const { tags, ...rest } = row;
  return { ...rest, tags: tags.map((t) => t.tag) };
}
