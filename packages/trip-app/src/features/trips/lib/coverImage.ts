/**
 * src/features/trips/lib/coverImage.ts
 *
 * Resolves a trip's `coverImageUrl` (an R2 object key from an upload, or a
 * user-supplied absolute URL) into something an <img> tag can load directly.
 */

const MAX_COVER_UPLOAD_BYTES = 5 * 1024 * 1024;

export function resolveCoverImageSrc(coverImageUrl: string): string {
  // Absolute URLs (user-supplied cover URL) and data URLs (mock-mode
  // uploads, which have no R2 to proxy through) are already loadable as-is.
  if (/^(https?:|data:)/i.test(coverImageUrl)) {
    return coverImageUrl;
  }
  return `/api/images/${encodeURIComponent(coverImageUrl)}`;
}

export function isValidCoverImageFile(file: File): boolean {
  return file.type.startsWith("image/") && file.size <= MAX_COVER_UPLOAD_BYTES;
}

export { MAX_COVER_UPLOAD_BYTES };
