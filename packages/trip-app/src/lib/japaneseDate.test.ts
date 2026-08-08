import { describe, expect, it } from "vitest";
import { DAY_MS, formatMD, formatMDWithDow, JA_DOW, parseLocalDate } from "@/lib/japaneseDate";

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD as a local-midnight date, not UTC", () => {
    const date = parseLocalDate("2026-08-08");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7); // 0-indexed
    expect(date.getDate()).toBe(8);
    expect(date.getHours()).toBe(0);
  });

  it("does not shift a day backward in a negative-UTC-offset timezone", () => {
    // `new Date("2026-08-08")` would parse as UTC midnight, which renders as
    // 2026-08-07 in any timezone behind UTC (AGENTS.md #5).
    const date = parseLocalDate("2026-08-08");
    expect(date.getDate()).not.toBe(7);
  });
});

describe("formatMD", () => {
  it("formats a date as M月D日", () => {
    expect(formatMD("2026-08-08")).toBe("8月8日");
  });

  it("does not zero-pad the month or day", () => {
    expect(formatMD("2026-01-05")).toBe("1月5日");
  });

  it("returns the input unchanged when malformed", () => {
    expect(formatMD("not-a-date")).toBe("not-a-date");
  });
});

describe("formatMDWithDow", () => {
  it("formats a date as M月D日(曜)", () => {
    // 2026-08-08 is a Saturday.
    expect(formatMDWithDow("2026-08-08")).toBe("8月8日(土)");
  });

  it("matches JA_DOW's Sunday-indexed labels", () => {
    // 2026-08-09 is a Sunday.
    expect(formatMDWithDow("2026-08-09")).toBe(`8月9日(${JA_DOW[0]})`);
  });
});

describe("DAY_MS", () => {
  it("is exactly one day in milliseconds", () => {
    expect(DAY_MS).toBe(24 * 60 * 60 * 1000);
  });
});
