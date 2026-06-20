import { formatDate, formatDateTime, generateId, isValidDateString } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("generateId", () => {
  it("prefixes the id with the given prefix", () => {
    expect(generateId("trip")).toMatch(/^trip_/);
  });

  it("produces unique ids on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId("x")));
    expect(ids.size).toBe(100);
  });
});

describe("formatDate", () => {
  it("returns a string input unchanged", () => {
    expect(formatDate("2026-06-20")).toBe("2026-06-20");
  });

  it("formats a Date to YYYY-MM-DD", () => {
    expect(formatDate(new Date("2026-06-20T10:30:00Z"))).toBe("2026-06-20");
  });
});

describe("formatDateTime", () => {
  it("converts an epoch timestamp to an ISO string", () => {
    expect(formatDateTime(0)).toBe("1970-01-01T00:00:00.000Z");
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
