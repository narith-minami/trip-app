/**
 * src/server/routes/schedule.ts
 *
 * Schedule items API endpoints.
 * Handles CRUD operations for trip schedule items.
 */

import { generateId } from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb, scheduleItems } from "../db";
import { requireSession } from "../middleware/auth";
import { requireMember } from "../middleware/requireMember";
import type { TripMemberContext } from "../middleware/requireMember";

const ERR_INTERNAL = "Internal server error";

// Schemas for schedule items
const CreateScheduleItemSchema = z.object({
  date: z.iso.date(),
  startTime: z.string().nullable().optional(),
  title: z.string().min(1),
  placeName: z.string().nullable().optional(),
  placeUrl: z.url().nullable().optional(),
  memo: z.string().nullable().optional(),
  orderIndex: z.number().int().default(0),
});

const UpdateScheduleItemSchema = CreateScheduleItemSchema.partial();

type ScheduleUpdateInput = Partial<typeof scheduleItems.$inferInsert>;

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
    updatedAt: new Date().getTime(),
  };
  if (validated.date) updateData.date = validated.date;
  if (validated.startTime !== undefined) updateData.startTime = validated.startTime;
  if (validated.title) updateData.title = validated.title;
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
      });

      return c.json({ data: items });
    } catch (error) {
      console.error("Error fetching schedule items:", error);
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
          title: validated.title,
          placeName: validated.placeName,
          placeUrl: validated.placeUrl,
          memo: validated.memo,
          orderIndex: validated.orderIndex,
          updatedBy: userId,
        });

        const created = await db.query.scheduleItems.findFirst({
          where: eq(scheduleItems.id, itemId),
        });

        return c.json(created, 201);
      } catch (error) {
        if (error instanceof Error && error.message.includes("validation")) {
          return c.json({ error: error.message }, 400);
        }
        console.error("Error creating schedule item:", error);
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
          return c.json({ error: "Item ID is required" }, 400);
        }
        const validated = c.req.valid("json");

        const db = getDb(c.env.DB);

        // Verify item belongs to trip
        const item = await db.query.scheduleItems.findFirst({
          where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
        });

        if (!item) {
          return c.json({ error: "Schedule item not found" }, 404);
        }

        const updateData = buildScheduleUpdate(validated, userId);

        await db.update(scheduleItems).set(updateData).where(eq(scheduleItems.id, itemId));

        const updated = await db.query.scheduleItems.findFirst({
          where: eq(scheduleItems.id, itemId),
        });

        return c.json(updated);
      } catch (error) {
        if (error instanceof Error && error.message.includes("validation")) {
          return c.json({ error: error.message }, 400);
        }
        console.error("Error updating schedule item:", error);
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
        return c.json({ error: "Item ID is required" }, 400);
      }
      const db = getDb(c.env.DB);

      // Verify item belongs to trip
      const item = await db.query.scheduleItems.findFirst({
        where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
      });

      if (!item) {
        return c.json({ error: "Schedule item not found" }, 404);
      }

      await db.delete(scheduleItems).where(eq(scheduleItems.id, itemId));

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting schedule item:", error);
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default scheduleRouter;
