/**
 * src/server/lib/upload.ts
 *
 * Shared image-upload flow for multipart endpoints (trip cover, schedule
 * item photos): validate the uploaded file and store it in R2. Keeping this
 * in one place guarantees both endpoints enforce the same type and size
 * rules.
 */

import type { R2Bucket } from "../env";

/** Maximum accepted image upload size (5 MB, per spec). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageUploadResult =
  | { ok: true; key: string }
  | { ok: false; status: 400 | 500 | 503; message: string };

/**
 * Validate the `file` field of a multipart form and upload it to R2.
 * `buildKey` receives the file extension (from the MIME subtype) and returns
 * the full object key.
 */
export async function uploadImage(options: {
  formData: FormData;
  bucket: R2Bucket | undefined;
  buildKey: (extension: string) => string;
  maxBytes?: number;
}): Promise<ImageUploadResult> {
  const { formData, bucket, buildKey, maxBytes = MAX_IMAGE_BYTES } = options;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, status: 400, message: "ファイルが提供されていません" };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, status: 400, message: "ファイルは画像でなければなりません" };
  }

  if (file.size > maxBytes) {
    return { ok: false, status: 400, message: "ファイルサイズは5MB以内にしてください" };
  }

  if (!bucket) {
    return { ok: false, status: 503, message: "R2ストレージが設定されていません" };
  }

  const key = buildKey(file.type.split("/")[1] ?? "bin");

  try {
    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
  } catch (error) {
    console.error("R2 upload failed", error);
    return { ok: false, status: 500, message: "画像のアップロードに失敗しました" };
  }

  return { ok: true, key };
}
