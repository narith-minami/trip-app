import { describe, expect, it } from "vitest";
import { validateNewPassword } from "@/lib/schemas/auth";

describe("validateNewPassword", () => {
  it("accepts a matching password of sufficient length", () => {
    expect(validateNewPassword("password123", "password123")).toBeNull();
  });

  it("rejects a mismatch", () => {
    expect(validateNewPassword("password123", "different123")).toBe("パスワードが一致しません");
  });

  it("rejects a matching password that's too short", () => {
    expect(validateNewPassword("short1", "short1")).toBe("パスワードは8文字以上にしてください");
  });

  it("reports mismatch before length when both are wrong", () => {
    expect(validateNewPassword("ab", "cd")).toBe("パスワードが一致しません");
  });
});
