/**
 * src/server/routes/memo.ts
 *
 * Memo API endpoints.
 * Handles CRUD operations for trip memos (upsert pattern).
 */

import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb, tripMemos } from "../db";
import { requireSession } from "../middleware/auth";
import { requireMember } from "../middleware/requireMember";
import type { TripMemberContext } from "../middleware/requireMember";

// Schemas for memo
const MemoSchema = z.object({
  content: z.string(),
});

/**
 * GET /api/trips/:tripId/memo
 * Get trip memo (upsert pattern - creates empty if doesn't exist)
 */
const memoRouter = new Hono<TripMemberContext>()
  .get("/", requireSession(), requireMember, async (c) => {
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
  })
  /**
   * PUT /api/trips/:tripId/memo
   * Update memo
   */
  .put("/", requireSession(), requireMember, zValidator("json", MemoSchema), async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      const tripId = c.get("tripId");
      const validated = c.req.valid("json");

      const db = getDb(c.env.DB);

      // Atomic upsert: insert the memo or update it if one already exists
      // for this trip. Avoids a read-then-write race under concurrency.
      await db
        .insert(tripMemos)
        .values({
          tripId,
          content: validated.content,
          updatedBy: userId,
          updatedAt: new Date().getTime(),
        })
        .onConflictDoUpdate({
          target: tripMemos.tripId,
          set: {
            content: validated.content,
            updatedBy: userId,
            updatedAt: new Date().getTime(),
          },
        });

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
