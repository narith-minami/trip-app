import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy class values with a single space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values (false, null, undefined)", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("keeps numeric values", () => {
    expect(cn("a", 0, 1)).toBe("a 1");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
