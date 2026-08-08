/**
 * src/server/lib/update.ts
 *
 * Shared building block for partial-update handlers.
 */

/**
 * Copy every defined property of `source` into a new object. The route-level
 * `buildXUpdate` helpers spread this so partial updates follow a single,
 * consistent `!== undefined` rule — omitted fields stay untouched while
 * explicit `""` / `null` values can clear a column (AGENTS.md #8).
 */
export function pickDefined<T extends object>(
  source: T
): {
  [K in keyof T]?: Exclude<T[K], undefined>;
} {
  const result: Partial<Record<keyof T, unknown>> = {};
  for (const key of Object.keys(source) as (keyof T)[]) {
    const value = source[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as { [K in keyof T]?: Exclude<T[K], undefined> };
}
