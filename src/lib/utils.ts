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
 * Format date string to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }
  return date.toISOString().split("T")[0];
}

/**
 * Parse ISO timestamp to readable format
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Check if date string is valid YYYY-MM-DD format
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}
