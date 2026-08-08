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
import { facilities, getDb, scheduleItemImages, scheduleItems } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

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
  isTentative: z.boolean().optional(),
  placeName: z.string().nullable().optional(),
  placeUrl: z.url().nullable().optional(),
  memo: z.string().nullable().optional(),
  facilityId: z.string().nullable().optional(),
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

/** Always embed a schedule item's photos and linked facility, for display. */
function withRelations() {
  return {
    images: { orderBy: [asc(scheduleItemImages.orderIndex)] },
    facility: true as const,
  };
}

/**
 * Applies the place/memo/eventType/tentative fields to `updateData`.
 * Split out of `buildScheduleUpdate` to keep cognitive complexity in check.
 */
function applyScheduleDetailFields(
  updateData: ScheduleUpdateInput,
  validated: z.infer<typeof UpdateScheduleItemSchema>
) {
  if (validated.eventType !== undefined) updateData.eventType = validated.eventType;
  if (validated.isTentative !== undefined) updateData.isTentative = validated.isTentative ? 1 : 0;
  if (validated.placeName !== undefined) updateData.placeName = validated.placeName;
  if (validated.placeUrl !== undefined) updateData.placeUrl = validated.placeUrl;
  if (validated.memo !== undefined) updateData.memo = validated.memo;
  if (validated.facilityId !== undefined) updateData.facilityId = validated.facilityId;
}

/**
 * Verify a facility belongs to the trip before linking it to a schedule item.
 * Returns true when `facilityId` is null/undefined (no link requested).
 */
async function isFacilityInTrip(
  db: ReturnType<typeof getDb>,
  tripId: string,
  facilityId: string | null | undefined
): Promise<boolean> {
  if (!facilityId) return true;
  const facility = await db.query.facilities.findFirst({
    where: and(eq(facilities.id, facilityId), eq(facilities.tripId, tripId)),
  });
  return Boolean(facility);
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
  applyScheduleDetailFields(updateData, validated);
  if (validated.orderIndex !== undefined) updateData.orderIndex = validated.orderIndex;
  return updateData;
}

/**
 * GET /api/trips/:tripId/schedule
 * List schedule items for a trip
 */
const scheduleRouter = new Hono<TripMemberContext>()
  .use("*", requireSession(), requireMember)
  .get("/", async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    const items = await db.query.scheduleItems.findMany({
      where: eq(scheduleItems.tripId, tripId),
      orderBy: (items, { asc }) => [asc(items.date), asc(items.orderIndex)],
      with: withRelations(),
    });

    return c.json({ data: items });
  })
  /**
   * POST /api/trips/:tripId/schedule
   * Create a schedule item
   */
  .post("/", zValidator("json", CreateScheduleItemSchema), async (c) => {
    const userId = c.get("user")?.id ?? null;
    const tripId = c.get("tripId");
    const validated = c.req.valid("json");

    const db = getDb(c.env.DB);

    if (!(await isFacilityInTrip(db, tripId, validated.facilityId))) {
      return c.json({ error: "施設が見つかりません" }, 400);
    }

    const itemId = generateId("schedule");

    await db.insert(scheduleItems).values({
      id: itemId,
      tripId,
      date: validated.date,
      startTime: validated.startTime,
      endTime: validated.endTime,
      title: validated.title,
      eventType: validated.eventType,
      isTentative: validated.isTentative ? 1 : 0,
      placeName: validated.placeName,
      placeUrl: validated.placeUrl,
      memo: validated.memo,
      facilityId: validated.facilityId,
      orderIndex: validated.orderIndex,
      updatedBy: userId,
    });

    const created = await db.query.scheduleItems.findFirst({
      where: eq(scheduleItems.id, itemId),
      with: withRelations(),
    });

    return c.json(created, 201);
  })
  /**
   * PUT /api/trips/:tripId/schedule/:itemId
   * Update a schedule item
   */
  .put("/:itemId", zValidator("json", UpdateScheduleItemSchema), async (c) => {
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

    if (!(await isFacilityInTrip(db, tripId, validated.facilityId))) {
      return c.json({ error: "施設が見つかりません" }, 400);
    }

    const updateData = buildScheduleUpdate(validated, userId);

    await db.update(scheduleItems).set(updateData).where(eq(scheduleItems.id, itemId));

    const updated = await db.query.scheduleItems.findFirst({
      where: eq(scheduleItems.id, itemId),
      with: withRelations(),
    });

    return c.json(updated);
  })
  /**
   * PATCH /api/trips/:tripId/schedule/reorder
   * Bulk update orderIndex for multiple schedule items
   */
  .patch("/reorder", zValidator("json", ReorderScheduleItemsSchema), async (c) => {
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

    // Batch all updates into one D1 request: atomic and avoids N+1 round
    // trips (AGENTS.md #4). The schema guarantees at least one item, but
    // destructuring keeps the non-empty tuple type db.batch requires.
    const now = Date.now();
    const [firstUpdate, ...restUpdates] = items.map(({ id, orderIndex }) =>
      db
        .update(scheduleItems)
        .set({ orderIndex, updatedAt: now, updatedBy: userId })
        .where(and(eq(scheduleItems.id, id), eq(scheduleItems.tripId, tripId)))
    );
    if (firstUpdate) {
      await db.batch([firstUpdate, ...restUpdates]);
    }

    return c.json({ success: true });
  })
  /**
   * POST /api/trips/:tripId/schedule/copy
   * Bulk-copy schedule items to a different date
   */
  .post("/copy", zValidator("json", CopyScheduleItemsSchema), async (c) => {
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
      isTentative: item.isTentative,
      placeName: item.placeName,
      placeUrl: item.placeUrl,
      memo: item.memo,
      facilityId: item.facilityId,
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
      with: { facility: true },
    });

    // Photos are never copied along with the item, so the relation is
    // always empty here — no need to query it.
    const createdWithImages = created.map((item) => ({ ...item, images: [] }));

    return c.json({ data: createdWithImages, count: createdWithImages.length }, 201);
  })
  /**
   * DELETE /api/trips/:tripId/schedule/:itemId
   * Delete a schedule item
   */
  .delete("/:itemId", async (c) => {
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
  });

export default scheduleRouter;
