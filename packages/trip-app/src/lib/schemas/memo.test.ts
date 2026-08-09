import { describe, expect, it } from "vitest";
import { MEMO_CONTENT_MAX, MemoSchema } from "@/lib/schemas/memo";

describe("MemoSchema", () => {
  it("accepts a normal memo", () => {
    const result = MemoSchema.safeParse({ content: "持ち物リストを忘れずに" });
    expect(result.success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = MemoSchema.safeParse({ content: "  こんにちは  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.content).toBe("こんにちは");
  });

  it("rejects an empty string", () => {
    const result = MemoSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only string", () => {
    const result = MemoSchema.safeParse({ content: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects content longer than the max length", () => {
    const result = MemoSchema.safeParse({ content: "a".repeat(MEMO_CONTENT_MAX + 1) });
    expect(result.success).toBe(false);
  });

  it("accepts content at exactly the max length", () => {
    const result = MemoSchema.safeParse({ content: "a".repeat(MEMO_CONTENT_MAX) });
    expect(result.success).toBe(true);
  });
});
