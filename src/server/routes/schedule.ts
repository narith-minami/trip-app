/**
 * src/server/routes/schedule.ts
 *
 * Schedule items API endpoints.
 * Handles CRUD operations for trip schedule items.
 */

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb, scheduleItems } from "../db";
import { requireSession, getUserId } from "../middleware/auth";
import { requireMember } from "../middleware/requireMember";
import { generateId } from "@/lib/utils";
import { z } from "zod";
import type { AuthContext } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";

// Schemas for schedule items
const CreateScheduleItemSchema = z.object({
  date: z.string().date(),
  startTime: z.string().optional(),
  title: z.string().min(1),
  placeName: z.string().optional(),
  placeUrl: z.string().url().optional(),
  memo: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

const UpdateScheduleItemSchema = CreateScheduleItemSchema.partial();

const scheduleRouter = new Hono<TripMemberContext>();

/**
 * GET /api/trips/:tripId/schedule
 * List schedule items for a trip
 */
scheduleRouter.get("/", requireSession(), requireMember, async (c) => {
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
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/trips/:tripId/schedule
 * Create a schedule item
 */
scheduleRouter.post("/", requireSession(), requireMember, async (c) => {
  try {
    const userId = getUserId(c as any);
    const tripId = c.get("tripId");
    const body = await c.req.json();
    const validated = CreateScheduleItemSchema.parse(body);

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
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * PUT /api/trips/:tripId/schedule/:itemId
 * Update a schedule item
 */
scheduleRouter.put("/:itemId", requireSession(), requireMember, async (c) => {
  try {
    const userId = getUserId(c as any);
    const tripId = c.get("tripId");
    const itemId = c.req.param("itemId");
    const body = await c.req.json();
    const validated = UpdateScheduleItemSchema.parse(body);

    const db = getDb(c.env.DB);

    // Verify item belongs to trip
    const item = await db.query.scheduleItems.findFirst({
      where: and(eq(scheduleItems.id, itemId), eq(scheduleItems.tripId, tripId)),
    });

    if (!item) {
      return c.json({ error: "Schedule item not found" }, 404);
    }

    const updateData: any = {};
    if (validated.date) updateData.date = validated.date;
    if (validated.startTime) updateData.startTime = validated.startTime;
    if (validated.title) updateData.title = validated.title;
    if (validated.placeName !== undefined) updateData.placeName = validated.placeName;
    if (validated.placeUrl !== undefined) updateData.placeUrl = validated.placeUrl;
    if (validated.memo !== undefined) updateData.memo = validated.memo;
    if (validated.orderIndex !== undefined) updateData.orderIndex = validated.orderIndex;
    updateData.updatedBy = userId;
    updateData.updatedAt = new Date().getTime();

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
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * DELETE /api/trips/:tripId/schedule/:itemId
 * Delete a schedule item
 */
scheduleRouter.delete("/:itemId", requireSession(), requireMember, async (c) => {
  try {
    const tripId = c.get("tripId");
    const itemId = c.req.param("itemId");
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
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default scheduleRouter;
