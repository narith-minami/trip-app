/**
 * src/server/routes/images.ts
 *
 * Serves R2-stored images (trip cover thumbnails, schedule item photos) back
 * to the browser. Object keys are opaque, unguessable ids minted by the
 * upload routes (cover.ts, scheduleImages.ts), so no per-trip authorization
 * check is needed beyond requiring a session.
 */

import { Hono } from "hono";
import type { AuthContext } from "../middleware/auth";
import { requireSession } from "../middleware/auth";

/**
 * GET /api/images/:key
 * Stream an R2 object back with its stored content type.
 */
const imagesRouter = new Hono<AuthContext>().get("/:key", requireSession(), async (c) => {
  if (!c.env.R2) {
    return c.json({ error: "R2ストレージが設定されていません" }, 503);
  }

  const key = c.req.param("key");
  if (!key) {
    return c.json({ error: "画像キーが必要です" }, 400);
  }
  const object = await c.env.R2.get(key);
  if (!object?.body) {
    return c.json({ error: "画像が見つかりません" }, 404);
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

export default imagesRouter;
