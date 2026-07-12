/**
 * src/lib/schemas/scrap.ts
 *
 * Zod schemas for scrap (standalone memo) data validation.
 * Isomorphic schemas used by both server and client.
 */

import { z } from "zod";

/** Max characters for a base64 data URL (~1MB image). Keeps D1 rows within limits. */
export const SCRAP_IMAGE_MAX_CHARS = 1_400_000;
/** Max raw file size (bytes) accepted client-side before base64 encoding (~1MB). */
export const SCRAP_IMAGE_MAX_BYTES = 1_000_000;
/** Max characters for the scrap body text. */
export const SCRAP_CONTENT_MAX = 5000;
/** Max characters for a single tag. */
export const SCRAP_TAG_MAX = 30;
/** Max number of tags per scrap. */
export const SCRAP_TAGS_MAX = 20;

/**
 * A single tag: trimmed, non-empty, length-bounded.
 */
const TagSchema = z.string().trim().min(1).max(SCRAP_TAG_MAX);

/**
 * Fields shared by create and update. Both `content` and `imageData` are
 * nullable so that either can be explicitly cleared (AGENTS.md #1). The refine
 * guarantees a scrap always has at least text or an image.
 */
const ScrapFields = {
  content: z.string().max(SCRAP_CONTENT_MAX, "本文は5000文字以内で入力してください").nullish(),
  imageData: z
    .string()
    .startsWith("data:image/", "画像はデータURL形式である必要があります")
    .max(SCRAP_IMAGE_MAX_CHARS, "画像サイズが大きすぎます")
    .nullish(),
  tags: z.array(TagSchema).max(SCRAP_TAGS_MAX, "タグは20個以内にしてください").optional(),
};

const hasBody = (data: { content?: string | null; imageData?: string | null }) =>
  (data.content?.trim().length ?? 0) > 0 || !!data.imageData;

/**
 * Schema for creating a new scrap.
 */
export const CreateScrapSchema = z.object(ScrapFields).refine(hasBody, {
  message: "テキストか画像のどちらかは必須です",
  path: ["content"],
});

export type CreateScrap = z.infer<typeof CreateScrapSchema>;

/**
 * Schema for updating a scrap (full replacement of the editable fields).
 */
export const UpdateScrapSchema = z.object(ScrapFields).refine(hasBody, {
  message: "テキストか画像のどちらかは必須です",
  path: ["content"],
});

export type UpdateScrap = z.infer<typeof UpdateScrapSchema>;
