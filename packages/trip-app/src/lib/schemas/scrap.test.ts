import { describe, expect, it } from "vitest";
import { CreateScrapSchema, SCRAP_TAGS_MAX, UpdateScrapSchema } from "@/lib/schemas/scrap";

const PNG = "data:image/png;base64,iVBORw0KGgo=";

describe("CreateScrapSchema", () => {
  it("accepts a text-only scrap", () => {
    const result = CreateScrapSchema.safeParse({ content: "旅先で見つけたカフェ" });
    expect(result.success).toBe(true);
  });

  it("accepts an image-only scrap", () => {
    const result = CreateScrapSchema.safeParse({ imageData: PNG });
    expect(result.success).toBe(true);
  });

  it("accepts text + image + tags", () => {
    const result = CreateScrapSchema.safeParse({
      content: "memo",
      imageData: PNG,
      tags: ["旅行", "カフェ"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty scrap (no text and no image)", () => {
    const result = CreateScrapSchema.safeParse({ content: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a completely empty payload", () => {
    const result = CreateScrapSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a non-image data URL", () => {
    const result = CreateScrapSchema.safeParse({ imageData: "data:text/plain;base64,aGk=" });
    expect(result.success).toBe(false);
  });

  it("trims tags and rejects empty ones", () => {
    const ok = CreateScrapSchema.safeParse({ content: "x", tags: ["  旅行  "] });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.tags).toEqual(["旅行"]);

    const bad = CreateScrapSchema.safeParse({ content: "x", tags: ["   "] });
    expect(bad.success).toBe(false);
  });

  it("rejects more than the max number of tags", () => {
    const tags = Array.from({ length: SCRAP_TAGS_MAX + 1 }, (_, i) => `tag${i}`);
    const result = CreateScrapSchema.safeParse({ content: "x", tags });
    expect(result.success).toBe(false);
  });
});

describe("UpdateScrapSchema", () => {
  it("accepts clearing text when an image remains", () => {
    const result = UpdateScrapSchema.safeParse({ content: null, imageData: PNG });
    expect(result.success).toBe(true);
  });

  it("rejects clearing both text and image", () => {
    const result = UpdateScrapSchema.safeParse({ content: null, imageData: null });
    expect(result.success).toBe(false);
  });
});
