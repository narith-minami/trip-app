/**
 * src/hooks/usePendingIds.ts
 *
 * Tracks in-flight item ids for optimistic UI (disabling a single row while
 * its mutation is pending). Uses a Set rather than a single id so rapid
 * actions on different rows don't clear each other's pending state.
 */

import { useState } from "react";

export function usePendingIds() {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());

  const addPending = (id: string) => setPendingIds((prev) => new Set(prev).add(id));
  const clearPending = (id: string) =>
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  return { pendingIds, addPending, clearPending };
}
