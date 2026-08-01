/**
 * src/server/routes/scheduleImage.ts
 *
 * Schedule item photo endpoints.
 * Uploads/removes the R2-backed photo attached to a single schedule item.
 * Split out from schedule.ts to keep that file under the line-count limit.
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { generateId } from "@/lib/utils";
import { getDb, scheduleItems } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

const ERR_INTERNAL = "内部サーバーエラー";
const ERR_ITEM_ID_REQUIRED = "アイテムIDが必要です";
const ERR_ITEM_NOT_FOUND = "スケジュールアイテムが見つかりません";

/**
 * POST /api/trips/:tripId/schedule/:itemId/image
 * Upload a photo for a schedule item to R2
 */
const scheduleImageRouter = new Hono<TripMemberContext>()
  .post("/:itemId/image", requireSession(), requireMember, async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      const tripId = c.get("tripId");
      const itemId = c.req.param("itemId");
      if (!itemId) {
        return c.json({ error: ERR_ITEM_ID_REQUIRED }, 400);
      }
      const db = getDb(c.env.DB);

      const item = await db.query.scheduleItems.findFirst({
        where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
      });

      if (!item) {
        return c.json({ error: ERR_ITEM_NOT_FOUND }, 404);
      }

      const formData = await c.req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return c.json({ error: "ファイルが提供されていません" }, 400);
      }

      if (!file.type.startsWith("image/")) {
        return c.json({ error: "ファイルは画像でなければなりません" }, 400);
      }

      if (!c.env.R2) {
        return c.json({ error: "R2ストレージが設定されていません" }, 503);
      }

      const buffer = await file.arrayBuffer();
      const fileName = `${tripId}-${itemId}-${generateId("schedule-image")}.${file.type.split("/")[1]}`;

      try {
        await c.env.R2.put(fileName, buffer, {
          httpMetadata: { contentType: file.type },
        });
      } catch (_error) {
        return c.json({ error: "画像のアップロードに失敗しました" }, 500);
      }

      await db
        .update(scheduleItems)
        .set({ imageUrl: fileName, updatedBy: userId, updatedAt: Date.now() })
        .where(eq(scheduleItems.id, itemId));

      const updated = await db.query.scheduleItems.findFirst({
        where: eq(scheduleItems.id, itemId),
      });

      return c.json(updated);
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * DELETE /api/trips/:tripId/schedule/:itemId/image
   * Remove the photo from a schedule item
   */
  .delete("/:itemId/image", requireSession(), requireMember, async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      const tripId = c.get("tripId");
      const itemId = c.req.param("itemId");
      if (!itemId) {
        return c.json({ error: ERR_ITEM_ID_REQUIRED }, 400);
      }
      const db = getDb(c.env.DB);

      const item = await db.query.scheduleItems.findFirst({
        where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
      });

      if (!item) {
        return c.json({ error: ERR_ITEM_NOT_FOUND }, 404);
      }

      if (item.imageUrl && c.env.R2) {
        await c.env.R2.delete(item.imageUrl);
      }

      await db
        .update(scheduleItems)
        .set({ imageUrl: null, updatedBy: userId, updatedAt: Date.now() })
        .where(eq(scheduleItems.id, itemId));

      const updated = await db.query.scheduleItems.findFirst({
        where: eq(scheduleItems.id, itemId),
      });

      return c.json(updated);
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default scheduleImageRouter;
