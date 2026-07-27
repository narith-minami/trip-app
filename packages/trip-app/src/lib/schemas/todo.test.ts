import { describe, expect, it } from "vitest";
import {
  TODO_COMMENT_MAX,
  TODO_DESCRIPTION_MAX,
  TodoCommentContentSchema,
  TodoDescriptionSchema,
  TodoDueDateSchema,
} from "@/lib/schemas/todo";

describe("TodoDescriptionSchema", () => {
  it("accepts a normal string", () => {
    const result = TodoDescriptionSchema.safeParse("詳細メモです");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("詳細メモです");
  });

  it("trims and normalises whitespace-only to null", () => {
    const result = TodoDescriptionSchema.safeParse("   ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBeNull();
  });

  it("accepts null and undefined (clearable)", () => {
    expect(TodoDescriptionSchema.safeParse(null).success).toBe(true);
    expect(TodoDescriptionSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects strings over the max length", () => {
    const result = TodoDescriptionSchema.safeParse("あ".repeat(TODO_DESCRIPTION_MAX + 1));
    expect(result.success).toBe(false);
  });
});

describe("TodoDueDateSchema", () => {
  it("accepts a valid YYYY-MM-DD", () => {
    const result = TodoDueDateSchema.safeParse("2025-08-15");
    expect(result.success).toBe(true);
  });

  it("accepts null and undefined (clearable)", () => {
    expect(TodoDueDateSchema.safeParse(null).success).toBe(true);
    expect(TodoDueDateSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects malformed dates", () => {
    expect(TodoDueDateSchema.safeParse("2025-13-01").success).toBe(false);
    expect(TodoDueDateSchema.safeParse("2025/08/15").success).toBe(false);
    expect(TodoDueDateSchema.safeParse("not-a-date").success).toBe(false);
  });
});

describe("TodoCommentContentSchema", () => {
  it("accepts a non-empty string", () => {
    const result = TodoCommentContentSchema.safeParse("  いいね！  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("いいね！");
  });

  it("rejects empty / whitespace-only", () => {
    expect(TodoCommentContentSchema.safeParse("").success).toBe(false);
    expect(TodoCommentContentSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects strings over the max length", () => {
    const result = TodoCommentContentSchema.safeParse("あ".repeat(TODO_COMMENT_MAX + 1));
    expect(result.success).toBe(false);
  });
});
