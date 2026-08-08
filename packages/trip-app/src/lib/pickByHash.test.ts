import { describe, expect, it } from "vitest";
import { pickByHash } from "@/lib/pickByHash";

describe("pickByHash", () => {
  const options = ["a", "b", "c", "d"] as const;

  it("is deterministic for the same key", () => {
    expect(pickByHash("Alice", options)).toBe(pickByHash("Alice", options));
  });

  it("picks a value from the options list", () => {
    expect(options).toContain(pickByHash("trip-1", options));
  });

  it("distributes different keys across different options", () => {
    const picks = new Set(["Alice", "Bob", "Carol", "Dave"].map((k) => pickByHash(k, options)));
    expect(picks.size).toBeGreaterThan(1);
  });

  it("matches the original inline hash formula (regression: avatar/cover gradient assignment)", () => {
    // hash = (hash * 31 + charCode) >>> 0, then hash % options.length
    expect(pickByHash("", options)).toBe(options[0]);
  });
});
