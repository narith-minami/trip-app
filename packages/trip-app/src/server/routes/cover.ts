/**
 * src/server/routes/cover.ts
 *
 * Cover photo API endpoints.
 * Handles cover image uploads to R2 and database updates.
 * Mounted at /api/trips/:tripId/cover.
 */

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { generateId } from "@/lib/utils";
import { getDb, trips } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

/**
 * POST /api/trips/:tripId/cover
 * Upload cover photo to R2 and update trip
 */
const coverRouter = new Hono<TripMemberContext>().post(
  "/",
  requireSession(),
  requireMember,
  async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      if (!userId) {
        return c.json({ error: "認証が必要です" }, 401);
      }

      const tripId = c.get("tripId");
      const db = getDb(c.env.DB);

      // Get trip
      const trip = await db.query.trips.findFirst({
        where: eq(trips.id, tripId),
      });

      if (!trip) {
        return c.json({ error: "旅行が見つかりません" }, 404);
      }

      // Only owner can update cover
      if (trip.ownerId !== userId) {
        return c.json({ error: "アクセスが拒否されました" }, 403);
      }

      // Get file from form data
      const formData = await c.req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return c.json({ error: "ファイルが提供されていません" }, 400);
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return c.json({ error: "ファイルは画像でなければなりません" }, 400);
      }

      // Validate file size (5MB max, per spec)
      const MAX_COVER_BYTES = 5 * 1024 * 1024;
      if (file.size > MAX_COVER_BYTES) {
        return c.json({ error: "ファイルサイズは5MB以内にしてください" }, 400);
      }

      // Upload to R2
      if (!c.env.R2) {
        return c.json({ error: "R2ストレージが設定されていません" }, 503);
      }

      const buffer = await file.arrayBuffer();
      const fileName = `${tripId}-${generateId("cover")}.${file.type.split("/")[1]}`;

      try {
        await c.env.R2.put(fileName, buffer, {
          httpMetadata: {
            contentType: file.type,
          },
        });
      } catch (_error) {
        return c.json({ error: "画像のアップロードに失敗しました" }, 500);
      }

      // Update trip with R2 key
      await db.update(trips).set({ coverImageUrl: fileName }).where(eq(trips.id, tripId));

      const updated = await db.query.trips.findFirst({
        where: eq(trips.id, tripId),
      });

      return c.json(updated);
    } catch (_error) {
      return c.json({ error: "内部サーバーエラー" }, 500);
    }
  }
);

export default coverRouter;
