/**
 * src/server/routes/memo.ts
 *
 * Memo API endpoints.
 * Handles CRUD operations for trip memos (upsert pattern).
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb, tripMemos } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

// Schemas for memo
const MemoSchema = z.object({
  content: z.string(),
});

/**
 * GET /api/trips/:tripId/memo
 * Get trip memo (upsert pattern - creates empty if doesn't exist)
 */
const memoRouter = new Hono<TripMemberContext>()
  .use("*", requireSession(), requireMember)
  .get("/", async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    // Lazily create an empty memo on first read. The atomic upsert avoids
    // the read-then-insert race and one extra round trip (AGENTS.md #9).
    await db.insert(tripMemos).values({ tripId, content: "" }).onConflictDoNothing();

    const memo = await db.query.tripMemos.findFirst({
      where: eq(tripMemos.tripId, tripId),
    });

    return c.json(memo);
  })
  /**
   * PUT /api/trips/:tripId/memo
   * Update memo
   */
  .put("/", zValidator("json", MemoSchema), async (c) => {
    const userId = c.get("user")?.id ?? null;
    const tripId = c.get("tripId");
    const validated = c.req.valid("json");

    const db = getDb(c.env.DB);

    // Atomic upsert: insert the memo or update it if one already exists
    // for this trip. Avoids a read-then-write race under concurrency.
    // RETURNING gives the stored row back without a second round trip.
    const [updated] = await db
      .insert(tripMemos)
      .values({
        tripId,
        content: validated.content,
        updatedBy: userId,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: tripMemos.tripId,
        set: {
          content: validated.content,
          updatedBy: userId,
          updatedAt: Date.now(),
        },
      })
      .returning();

    return c.json(updated);
  });

export default memoRouter;
