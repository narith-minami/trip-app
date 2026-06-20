/**
 * src/lib/cn.ts
 *
 * Lightweight className combiner used by UI primitives.
 * Joins truthy class values into a single space-separated string.
 * Dependency-free to keep the UI layer self-contained.
 */

type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
