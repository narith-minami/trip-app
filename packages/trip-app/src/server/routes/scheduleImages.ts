/**
 * src/server/routes/scheduleImages.ts
 *
 * Photo endpoints for a single schedule item (create/delete). A schedule
 * item can have any number of photos; they're always read embedded in the
 * schedule item response (see `withRelations` in ./schedule.ts), so there's
 * no GET here. Mounted under `/api/trips/:tripId/schedule/:itemId/images` so
 * `requireMember` is inherited — same shape as `todoComments.ts`.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { generateId } from "@/lib/utils";
import { getDb, scheduleItemImages, scheduleItems } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

const ERR_ITEM_NOT_FOUND = "スケジュールアイテムが見つかりません";

/**
 * Verify that the schedule item belongs to the given trip. Returns the item
 * row or null.
 */
async function findItemInTrip(db: ReturnType<typeof getDb>, itemId: string, tripId: string) {
  return db.query.scheduleItems.findFirst({
    where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
  });
}

const scheduleImagesRouter = new Hono<TripMemberContext>()
  /**
   * POST /api/trips/:tripId/schedule/:itemId/images
   * Upload a new photo for a schedule item to R2 (appended, not replaced)
   */
  .post("/", requireSession(), requireMember, async (c) => {
    const tripId = c.get("tripId");
    const itemId = c.req.param("itemId");
    if (!itemId) {
      return c.json({ error: "アイテムIDが必要です" }, 400);
    }
    const db = getDb(c.env.DB);

    const item = await findItemInTrip(db, itemId, tripId);
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

    const existing = await db.query.scheduleItemImages.findMany({
      where: eq(scheduleItemImages.scheduleItemId, itemId),
      columns: { id: true },
    });

    const imageId = generateId("scheduleImage");
    const now = Date.now();
    const orderIndex = existing.length;
    await db.insert(scheduleItemImages).values({
      id: imageId,
      scheduleItemId: itemId,
      imageUrl: fileName,
      orderIndex,
      createdAt: now,
    });

    return c.json(
      { id: imageId, scheduleItemId: itemId, imageUrl: fileName, orderIndex, createdAt: now },
      201
    );
  })
  /**
   * DELETE /api/trips/:tripId/schedule/:itemId/images/:imageId
   * Remove a single photo from a schedule item
   */
  .delete("/:imageId", requireSession(), requireMember, async (c) => {
    const tripId = c.get("tripId");
    const itemId = c.req.param("itemId");
    const imageId = c.req.param("imageId");
    if (!itemId || !imageId) {
      return c.json({ error: "IDが必要です" }, 400);
    }
    const db = getDb(c.env.DB);

    const item = await findItemInTrip(db, itemId, tripId);
    if (!item) {
      return c.json({ error: ERR_ITEM_NOT_FOUND }, 404);
    }

    const image = await db.query.scheduleItemImages.findFirst({
      where: and(eq(scheduleItemImages.id, imageId), eq(scheduleItemImages.scheduleItemId, itemId)),
    });
    if (!image) {
      return c.json({ error: "写真が見つかりません" }, 404);
    }

    if (c.env.R2) {
      await c.env.R2.delete(image.imageUrl);
    }

    await db.delete(scheduleItemImages).where(eq(scheduleItemImages.id, imageId));

    return c.json({ success: true });
  });

export default scheduleImagesRouter;
