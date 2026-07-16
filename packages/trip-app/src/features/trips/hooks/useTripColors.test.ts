/**
 * src/features/trips/hooks/useTripColors.test.ts
 *
 * Unit tests for the pure storage helpers behind the per-trip color hook.
 * (The repo test runner uses the Node environment, so we test the pure
 * serialization/parsing logic rather than rendering the React hook.)
 */

import { describe, expect, it } from "vitest";
import {
  DEFAULT_BACKGROUND,
  EMPTY_COLORS,
  HEADER_PICKER_DEFAULT,
  parseStoredColors,
  storageKey,
} from "./useTripColors";

describe("storageKey", () => {
  it("namespaces the key per trip id", () => {
    expect(storageKey("trip-1")).toBe("trip-app:trip-colors:trip-1");
    expect(storageKey("abc")).not.toBe(storageKey("def"));
  });
});

describe("parseStoredColors", () => {
  it("returns empty colors for null / empty input", () => {
    expect(parseStoredColors(null)).toEqual(EMPTY_COLORS);
    expect(parseStoredColors("")).toEqual(EMPTY_COLORS);
  });

  it("parses a fully populated saved value", () => {
    const raw = JSON.stringify({ backgroundColor: "#123456", headerColor: "#abcdef" });
    expect(parseStoredColors(raw)).toEqual({
      backgroundColor: "#123456",
      headerColor: "#abcdef",
    });
  });

  it("fills missing fields with null", () => {
    expect(parseStoredColors(JSON.stringify({ backgroundColor: "#111111" }))).toEqual({
      backgroundColor: "#111111",
      headerColor: null,
    });
  });

  it("falls back to empty colors on malformed JSON", () => {
    expect(parseStoredColors("{not-json")).toEqual(EMPTY_COLORS);
  });

  it("exposes sensible default color constants for pickers", () => {
    expect(DEFAULT_BACKGROUND).toMatch(/^#[0-9a-f]{6}$/i);
    expect(HEADER_PICKER_DEFAULT).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
