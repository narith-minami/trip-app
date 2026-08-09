/**
 * src/features/trips/lib/coverImage.ts
 *
 * Resolves a trip's `coverImageUrl` (an R2 object key from an upload, or a
 * user-supplied absolute URL) into something an <img> tag can load directly.
 */

import { resolveImageSrc } from "@/lib/imageSrc";

const MAX_COVER_UPLOAD_BYTES = 5 * 1024 * 1024;

export function resolveCoverImageSrc(coverImageUrl: string): string {
  return resolveImageSrc(coverImageUrl);
}

export function isValidCoverImageFile(file: File): boolean {
  return file.type.startsWith("image/") && file.size <= MAX_COVER_UPLOAD_BYTES;
}

export { MAX_COVER_UPLOAD_BYTES };
