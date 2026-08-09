import { describe, expect, it } from "vitest";
import { resolveImageSrc } from "@/lib/imageSrc";

describe("resolveImageSrc", () => {
  it("passes absolute http(s) URLs through unchanged", () => {
    expect(resolveImageSrc("https://example.com/photo.jpg")).toBe("https://example.com/photo.jpg");
    expect(resolveImageSrc("http://example.com/photo.jpg")).toBe("http://example.com/photo.jpg");
  });

  it("resolves R2 object keys to the images proxy route", () => {
    expect(resolveImageSrc("trip123-item456-scheduleImage789.jpg")).toBe(
      "/api/images/trip123-item456-scheduleImage789.jpg"
    );
  });

  it("passes data URLs through unchanged (mock-mode uploads)", () => {
    const dataUrl = "data:image/png;base64,AAAA";
    expect(resolveImageSrc(dataUrl)).toBe(dataUrl);
  });
});
