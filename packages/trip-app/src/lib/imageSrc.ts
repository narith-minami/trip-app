/**
 * src/lib/imageSrc.ts
 *
 * Resolves a stored image reference (an R2 object key from an upload, or a
 * user-supplied absolute URL) into something an <img> tag can load directly.
 * Used for trip cover images and schedule item photos alike.
 */

export function resolveImageSrc(imageUrl: string): string {
  // Absolute URLs (user-supplied cover URL) and data URLs (mock-mode
  // uploads, which have no R2 to proxy through) are already loadable as-is.
  if (/^(https?:|data:)/i.test(imageUrl)) {
    return imageUrl;
  }
  return `/api/images/${encodeURIComponent(imageUrl)}`;
}
