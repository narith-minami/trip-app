import { describe, expect, it } from "vitest";
import { generateId, isValidDateString } from "@/lib/utils";

describe("generateId", () => {
  it("prefixes the id with the given prefix", () => {
    expect(generateId("trip")).toMatch(/^trip_/);
  });

  it("produces unique ids on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId("x")));
    expect(ids.size).toBe(100);
  });
});

describe("isValidDateString", () => {
  it("accepts a well-formed YYYY-MM-DD date", () => {
    expect(isValidDateString("2026-06-20")).toBe(true);
  });

  it("rejects malformed input", () => {
    expect(isValidDateString("2026/06/20")).toBe(false);
    expect(isValidDateString("not-a-date")).toBe(false);
  });

  it("rejects an impossible calendar date", () => {
    expect(isValidDateString("2026-13-40")).toBe(false);
  });
});
