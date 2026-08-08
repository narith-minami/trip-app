/**
 * src/lib/colorContrast.ts
 *
 * Derives a readable text/icon tone from a background color, so header text
 * and icons never need to be picked independently of the background — see
 * "ヘッダー個別編集機能の廃止" in the Tabigo spec.
 */

export type ContrastTone = "dark" | "light";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = Number.parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/**
 * WCAG-adjacent relative luminance check. Returns which tone ("dark" or
 * "light" text/icons) reads best against the given hex background.
 */
export function getContrastTone(bgHex: string): ContrastTone {
  const { r, g, b } = hexToRgb(bgHex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "dark" : "light";
}
