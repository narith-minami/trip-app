/**
 * src/lib/japaneseDate.ts
 *
 * Shared date parsing/formatting for Japanese-locale display. Parses a
 * YYYY-MM-DD string by its Y/M/D components instead of `new Date(str)`,
 * which avoids the UTC-midnight shift AGENTS.md #5 warns about.
 */

/** Japanese day-of-week labels, indexed like `Date#getDay()` (0 = Sunday). */
export const JA_DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** Milliseconds in a day, for day-diff arithmetic on local-midnight `Date`s. */
export const DAY_MS = 86_400_000;

/** Parses a `YYYY-MM-DD` string as a local-timezone date. */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formats a `YYYY-MM-DD` string as "M月D日". Returns the input unchanged if malformed. */
export function formatMD(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  if (!m || !d) return dateStr;
  return `${m}月${d}日`;
}

/** Formats a `YYYY-MM-DD` string as "M月D日(曜)". */
export function formatMDWithDow(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日(${JA_DOW[date.getDay()]})`;
}
