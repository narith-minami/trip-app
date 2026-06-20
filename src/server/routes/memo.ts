/**
 * src/server/routes/memo.ts
 *
 * Memo API endpoints.
 * Handles CRUD operations for trip memos (upsert pattern).
 */

import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, tripMemos } from "../db";
import { requireSession, getUserId } from "../middleware/auth";
import { requireMember } from "../middleware/requireMember";
import { z } from "zod";
import type { AuthContext } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";

// Schemas for memo
const MemoSchema = z.object({
  content: z.string(),
});

const memoRouter = new Hono<TripMemberContext>();

/**
 * GET /api/trips/:tripId/memo
 * Get trip memo (upsert pattern - creates empty if doesn't exist)
 */
memoRouter.get("/", requireSession(), requireMember, async (c) => {
  try {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    let memo = await db.query.tripMemos.findFirst({
      where: eq(tripMemos.tripId, tripId),
    });

    // If memo doesn't exist, create empty one
    if (!memo) {
      await db.insert(tripMemos).values({
        tripId,
        content: "",
      });

      memo = await db.query.tripMemos.findFirst({
        where: eq(tripMemos.tripId, tripId),
      });
    }

    return c.json(memo);
  } catch (error) {
    console.error("Error fetching memo:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * PUT /api/trips/:tripId/memo
 * Update memo
 */
memoRouter.put("/", requireSession(), requireMember, async (c) => {
  try {
    const userId = getUserId(c as any);
    const tripId = c.get("tripId");
    const body = await c.req.json();
    const validated = MemoSchema.parse(body);

    const db = getDb(c.env.DB);

    // Get existing memo
    let memo = await db.query.tripMemos.findFirst({
      where: eq(tripMemos.tripId, tripId),
    });

    if (!memo) {
      // Create if doesn't exist
      await db.insert(tripMemos).values({
        tripId,
        content: validated.content,
        updatedBy: userId,
      });
    } else {
      // Update if exists
      await db
        .update(tripMemos)
        .set({
          content: validated.content,
          updatedBy: userId,
          updatedAt: new Date().getTime(),
        })
        .where(eq(tripMemos.tripId, tripId));
    }

    const updated = await db.query.tripMemos.findFirst({
      where: eq(tripMemos.tripId, tripId),
    });

    return c.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return c.json({ error: error.message }, 400);
    }
    console.error("Error updating memo:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default memoRouter;
