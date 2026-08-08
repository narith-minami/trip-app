import { describe, expect, it } from "vitest";
import { getContrastTone } from "@/lib/colorContrast";

describe("getContrastTone", () => {
  it("returns dark for light backgrounds", () => {
    expect(getContrastTone("#ffffff")).toBe("dark");
    expect(getContrastTone("#fff8f0")).toBe("dark");
  });

  it("returns light for dark backgrounds", () => {
    expect(getContrastTone("#0f1c2e")).toBe("light");
    expect(getContrastTone("#000000")).toBe("light");
  });

  it("supports 3-digit hex shorthand", () => {
    expect(getContrastTone("#fff")).toBe("dark");
    expect(getContrastTone("#000")).toBe("light");
  });
});
