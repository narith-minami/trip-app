/**
 * src/lib/utils.ts
 *
 * Utility functions used across the application.
 */

/**
 * Generate a unique ID with a prefix
 * @param prefix - The prefix for the ID (e.g., "trip", "schedule", "todo")
 * @returns A unique ID string
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Check if date string is valid YYYY-MM-DD format
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !Number.isNaN(date.getTime());
}

/** Enumerate every YYYY-MM-DD date from `start` to `end`, inclusive. */
export function generateDateRange(start: string, end: string): string[] {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const dates: string[] = [];
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    dates.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}
