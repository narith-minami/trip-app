/**
 * src/lib/todoPriority.ts
 *
 * Todo priority levels. Pure module (no icon/UI imports) so it can be shared
 * by both the Hono server routes (Zod enum) and the React client.
 */

/**
 * Priority keys, ordered highest-first. Kept as a readonly tuple so it can be
 * passed straight to `z.enum(...)` on the server.
 */
export const TODO_PRIORITY_KEYS = ["high", "medium", "low"] as const;

export type TodoPriority = (typeof TODO_PRIORITY_KEYS)[number];

/** Default priority applied when none is supplied. */
export const DEFAULT_TODO_PRIORITY: TodoPriority = "medium";

export const TODO_PRIORITIES = {
  high: { label: "高", color: "#EF4444", order: 0 },
  medium: { label: "中", color: "#F59E0B", order: 1 },
  low: { label: "低", color: "#9CA3AF", order: 2 },
} as const satisfies Record<TodoPriority, { label: string; color: string; order: number }>;

/** Preset list for building selectors (highest priority first). */
export const TODO_PRIORITY_LIST = TODO_PRIORITY_KEYS.map((key) => ({
  key,
  ...TODO_PRIORITIES[key],
}));

/**
 * Resolve a raw priority string to its metadata, falling back to the default
 * when the value is missing or unknown.
 */
export function resolveTodoPriority(
  priority?: string | null
): (typeof TODO_PRIORITIES)[TodoPriority] {
  if (priority && Object.hasOwn(TODO_PRIORITIES, priority)) {
    return TODO_PRIORITIES[priority as TodoPriority];
  }
  return TODO_PRIORITIES[DEFAULT_TODO_PRIORITY];
}

/** Sort order used to rank a raw priority value (unknown → default order). */
export function todoPriorityOrder(priority?: string | null): number {
  return resolveTodoPriority(priority).order;
}
