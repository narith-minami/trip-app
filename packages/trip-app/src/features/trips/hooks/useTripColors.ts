/**
 * src/features/trips/hooks/useTripColors.ts
 *
 * Per-trip color customization persisted to the browser's localStorage.
 * Lets the user override the trip detail page background and the hero header
 * color. `null` means "unset" — the original default look is used instead.
 */

import { useCallback, useState } from "react";

/** Default page background (matches the `--color-bg` / cream token). */
export const DEFAULT_BACKGROUND = "#fff8f0";
/** Initial value shown in the header color picker when nothing is saved yet. */
export const HEADER_PICKER_DEFAULT = "#5b8a6f";

export interface TripColors {
  backgroundColor: string | null;
  headerColor: string | null;
}

export const EMPTY_COLORS: TripColors = { backgroundColor: null, headerColor: null };

/** localStorage key for a trip's saved colors. */
export function storageKey(tripId: string): string {
  return `trip-app:trip-colors:${tripId}`;
}

/** Parse and normalize a raw localStorage value into a `TripColors`. */
export function parseStoredColors(raw: string | null): TripColors {
  if (!raw) return EMPTY_COLORS;
  try {
    const parsed = JSON.parse(raw) as Partial<TripColors>;
    return {
      backgroundColor: parsed.backgroundColor ?? null,
      headerColor: parsed.headerColor ?? null,
    };
  } catch {
    return EMPTY_COLORS;
  }
}

function readColors(tripId: string): TripColors {
  if (typeof window === "undefined") return EMPTY_COLORS;
  try {
    return parseStoredColors(window.localStorage.getItem(storageKey(tripId)));
  } catch {
    // Accessing localStorage can throw (SecurityError in private mode / blocked
    // storage) — fall back to defaults instead of crashing on mount.
    return EMPTY_COLORS;
  }
}

export interface UseTripColorsResult extends TripColors {
  /** Merge a partial update and persist it. */
  setColors: (partial: Partial<TripColors>) => void;
  /** Clear all saved colors and revert to the default look. */
  reset: () => void;
}

export function useTripColors(tripId: string): UseTripColorsResult {
  // Lazy initializer reads localStorage once (guarded for SSR / no-window).
  const [colors, setColorsState] = useState<TripColors>(() => readColors(tripId));
  const [loadedTripId, setLoadedTripId] = useState(tripId);

  // Re-read when the trip changes without a remount (e.g. trip→trip navigation).
  // Adjusting state during render is React's recommended pattern here — it avoids
  // both the useEffect props→state sync (AGENTS.md #2) and the color flash a
  // post-render effect would cause.
  if (tripId !== loadedTripId) {
    setLoadedTripId(tripId);
    setColorsState(readColors(tripId));
  }

  const setColors = useCallback(
    (partial: Partial<TripColors>) => {
      setColorsState((prev) => {
        const next: TripColors = { ...prev, ...partial };
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(storageKey(tripId), JSON.stringify(next));
          } catch {
            // Ignore write failures (private mode / quota) — state still updates.
          }
        }
        return next;
      });
    },
    [tripId]
  );

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(storageKey(tripId));
      } catch {
        // Ignore removal failures.
      }
    }
    setColorsState(EMPTY_COLORS);
  }, [tripId]);

  return {
    backgroundColor: colors.backgroundColor,
    headerColor: colors.headerColor,
    setColors,
    reset,
  };
}
