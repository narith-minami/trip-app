import { describe, expect, it } from "vitest";
import { isValidCoverImageFile, resolveCoverImageSrc } from "@/features/trips/lib/coverImage";

describe("resolveCoverImageSrc", () => {
  it("passes absolute http(s) URLs through unchanged", () => {
    expect(resolveCoverImageSrc("https://example.com/photo.jpg")).toBe(
      "https://example.com/photo.jpg"
    );
    expect(resolveCoverImageSrc("http://example.com/photo.jpg")).toBe(
      "http://example.com/photo.jpg"
    );
  });

  it("resolves R2 object keys to the images proxy route", () => {
    expect(resolveCoverImageSrc("trip123-cover456.jpg")).toBe("/api/images/trip123-cover456.jpg");
  });

  it("passes data URLs through unchanged (mock-mode uploads)", () => {
    const dataUrl = "data:image/png;base64,AAAA";
    expect(resolveCoverImageSrc(dataUrl)).toBe(dataUrl);
  });
});

describe("isValidCoverImageFile", () => {
  function makeFile(type: string, size: number): File {
    return new File([new Uint8Array(size)], "cover.jpg", { type });
  }

  it("accepts images within the size limit", () => {
    expect(isValidCoverImageFile(makeFile("image/jpeg", 1024))).toBe(true);
  });

  it("rejects non-image files", () => {
    expect(isValidCoverImageFile(makeFile("application/pdf", 1024))).toBe(false);
  });

  it("rejects files over 5MB", () => {
    expect(isValidCoverImageFile(makeFile("image/jpeg", 5 * 1024 * 1024 + 1))).toBe(false);
  });
});
