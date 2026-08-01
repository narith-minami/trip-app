/**
 * src/server/routes/schedule.ts
 *
 * Schedule items API endpoints.
 * Handles CRUD operations for trip schedule items.
 */

import { zValidator } from "@hono/zod-validator";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { generateId } from "@/lib/utils";
import { getDb, scheduleItemImages, scheduleItems } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

const ERR_INTERNAL = "内部サーバーエラー";

const EVENT_TYPE_VALUES = [
  "food",
  "flight",
  "train",
  "sightseeing",
  "activity",
  "hotel",
  "shopping",
  "other",
] as const;

// Schemas for schedule items
const CreateScheduleItemSchema = z.object({
  date: z.iso.date(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  title: z.string().min(1),
  eventType: z.enum(EVENT_TYPE_VALUES).nullable().optional(),
  placeName: z.string().nullable().optional(),
  placeUrl: z.url().nullable().optional(),
  memo: z.string().nullable().optional(),
  orderIndex: z.number().int().default(0),
});

const UpdateScheduleItemSchema = CreateScheduleItemSchema.partial();

const ReorderScheduleItemsSchema = z.object({
  items: z
    .array(z.object({ id: z.string(), orderIndex: z.number().int().min(0) }))
    .min(1)
    .max(100),
});

const CopyScheduleItemsSchema = z.object({
  targetDate: z.iso.date(),
  itemIds: z.array(z.string()).min(1).max(50),
});

type ScheduleUpdateInput = Partial<typeof scheduleItems.$inferInsert>;

/** Always embed a schedule item's photos, ordered for display. */
function withImages() {
  return { images: { orderBy: [asc(scheduleItemImages.orderIndex)] } };
}

/**
 * Build the schedule-item fields to update from validated input.
 * `!== undefined` checks let callers explicitly clear nullable fields.
 */
function buildScheduleUpdate(
  validated: z.infer<typeof UpdateScheduleItemSchema>,
  userId: string | null
): ScheduleUpdateInput {
  const updateData: ScheduleUpdateInput = {
    updatedBy: userId,
    updatedAt: Date.now(),
  };
  if (validated.date) updateData.date = validated.date;
  if (validated.startTime !== undefined) updateData.startTime = validated.startTime;
  if (validated.endTime !== undefined) updateData.endTime = validated.endTime;
  if (validated.title) updateData.title = validated.title;
  if (validated.eventType !== undefined) updateData.eventType = validated.eventType;
  if (validated.placeName !== undefined) updateData.placeName = validated.placeName;
  if (validated.placeUrl !== undefined) updateData.placeUrl = validated.placeUrl;
  if (validated.memo !== undefined) updateData.memo = validated.memo;
  if (validated.orderIndex !== undefined) updateData.orderIndex = validated.orderIndex;
  return updateData;
}

/**
 * GET /api/trips/:tripId/schedule
 * List schedule items for a trip
 */
const scheduleRouter = new Hono<TripMemberContext>()
  .get("/", requireSession(), requireMember, async (c) => {
    try {
      const tripId = c.get("tripId");
      const db = getDb(c.env.DB);

      const items = await db.query.scheduleItems.findMany({
        where: eq(scheduleItems.tripId, tripId),
        orderBy: (items, { asc }) => [asc(items.date), asc(items.orderIndex)],
        with: withImages(),
      });

      return c.json({ data: items });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * POST /api/trips/:tripId/schedule
   * Create a schedule item
   */
  .post(
    "/",
    requireSession(),
    requireMember,
    zValidator("json", CreateScheduleItemSchema),
    async (c) => {
      try {
        const userId = c.get("user")?.id ?? null;
        const tripId = c.get("tripId");
        const validated = c.req.valid("json");

        const db = getDb(c.env.DB);
        const itemId = generateId("schedule");

        await db.insert(scheduleItems).values({
          id: itemId,
          tripId,
          date: validated.date,
          startTime: validated.startTime,
          endTime: validated.endTime,
          title: validated.title,
          eventType: validated.eventType,
          placeName: validated.placeName,
          placeUrl: validated.placeUrl,
          memo: validated.memo,
          orderIndex: validated.orderIndex,
          updatedBy: userId,
        });

        const created = await db.query.scheduleItems.findFirst({
          where: eq(scheduleItems.id, itemId),
          with: withImages(),
        });

        return c.json(created, 201);
      } catch (error) {
        if (error instanceof Error && error.message.includes("validation")) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: ERR_INTERNAL }, 500);
      }
    }
  )
  /**
   * PUT /api/trips/:tripId/schedule/:itemId
   * Update a schedule item
   */
  .put(
    "/:itemId",
    requireSession(),
    requireMember,
    zValidator("json", UpdateScheduleItemSchema),
    async (c) => {
      try {
        const userId = c.get("user")?.id ?? null;
        const tripId = c.get("tripId");
        const itemId = c.req.param("itemId");
        if (!itemId) {
          return c.json({ error: "アイテムIDが必要です" }, 400);
        }
        const validated = c.req.valid("json");

        const db = getDb(c.env.DB);

        // Verify item belongs to trip
        const item = await db.query.scheduleItems.findFirst({
          where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
        });

        if (!item) {
          return c.json({ error: "スケジュールアイテムが見つかりません" }, 404);
        }

        const updateData = buildScheduleUpdate(validated, userId);

        await db.update(scheduleItems).set(updateData).where(eq(scheduleItems.id, itemId));

        const updated = await db.query.scheduleItems.findFirst({
          where: eq(scheduleItems.id, itemId),
          with: withImages(),
        });

        return c.json(updated);
      } catch (error) {
        if (error instanceof Error && error.message.includes("validation")) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: ERR_INTERNAL }, 500);
      }
    }
  )
  /**
   * PATCH /api/trips/:tripId/schedule/reorder
   * Bulk update orderIndex for multiple schedule items
   */
  .patch(
    "/reorder",
    requireSession(),
    requireMember,
    zValidator("json", ReorderScheduleItemsSchema),
    async (c) => {
      try {
        const tripId = c.get("tripId");
        const userId = c.get("user")?.id ?? null;
        const { items } = c.req.valid("json");
        const db = getDb(c.env.DB);

        // Verify all items belong to this trip
        const existing = await db.query.scheduleItems.findMany({
          where: and(
            eq(scheduleItems.tripId, tripId),
            inArray(
              scheduleItems.id,
              items.map((i) => i.id)
            )
          ),
        });
        if (existing.length !== items.length) {
          return c.json({ error: "1件以上のアイテムが見つかりません" }, 404);
        }

        const now = Date.now();
        for (const { id, orderIndex } of items) {
          await db
            .update(scheduleItems)
            .set({ orderIndex, updatedAt: now, updatedBy: userId })
            .where(and(eq(scheduleItems.id, id), eq(scheduleItems.tripId, tripId)));
        }

        return c.json({ success: true });
      } catch (_error) {
        return c.json({ error: ERR_INTERNAL }, 500);
      }
    }
  )
  /**
   * POST /api/trips/:tripId/schedule/copy
   * Bulk-copy schedule items to a different date
   */
  .post(
    "/copy",
    requireSession(),
    requireMember,
    zValidator("json", CopyScheduleItemsSchema),
    async (c) => {
      try {
        const tripId = c.get("tripId");
        const userId = c.get("user")?.id ?? null;
        const { targetDate, itemIds } = c.req.valid("json");
        const db = getDb(c.env.DB);

        const existing = await db.query.scheduleItems.findMany({
          where: and(eq(scheduleItems.tripId, tripId), inArray(scheduleItems.id, itemIds)),
        });
        if (existing.length !== itemIds.length) {
          return c.json({ error: "1件以上のアイテムが見つかりません" }, 404);
        }

        const now = Date.now();
        const insertRows = existing.map((item) => ({
          id: generateId("schedule"),
          tripId,
          date: targetDate,
          startTime: item.startTime,
          endTime: item.endTime,
          title: item.title,
          eventType: item.eventType,
          placeName: item.placeName,
          placeUrl: item.placeUrl,
          memo: item.memo,
          orderIndex: item.orderIndex,
          updatedBy: userId,
          createdAt: now,
          updatedAt: now,
        }));

        await db.insert(scheduleItems).values(insertRows);

        const created = await db.query.scheduleItems.findMany({
          where: inArray(
            scheduleItems.id,
            insertRows.map((r) => r.id)
          ),
        });

        // Photos are never copied along with the item, so the relation is
        // always empty here — no need to query it.
        const createdWithImages = created.map((item) => ({ ...item, images: [] }));

        return c.json({ data: createdWithImages, count: createdWithImages.length }, 201);
      } catch (_error) {
        return c.json({ error: ERR_INTERNAL }, 500);
      }
    }
  )
  /**
   * DELETE /api/trips/:tripId/schedule/:itemId
   * Delete a schedule item
   */
  .delete("/:itemId", requireSession(), requireMember, async (c) => {
    try {
      const tripId = c.get("tripId");
      const itemId = c.req.param("itemId");
      if (!itemId) {
        return c.json({ error: "アイテムIDが必要です" }, 400);
      }
      const db = getDb(c.env.DB);

      // Verify item belongs to trip
      const item = await db.query.scheduleItems.findFirst({
        where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
      });

      if (!item) {
        return c.json({ error: "スケジュールアイテムが見つかりません" }, 404);
      }

      await db.batch([
        db.delete(scheduleItemImages).where(eq(scheduleItemImages.scheduleItemId, itemId)),
        db.delete(scheduleItems).where(eq(scheduleItems.id, itemId)),
      ]);

      return c.json({ success: true });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default scheduleRouter;
