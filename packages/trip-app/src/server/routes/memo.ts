/**
 * src/server/routes/memo.ts
 *
 * Memo (sticky note) API endpoints.
 * Handles CRUD operations for trip memos. Any trip member can create or edit
 * a memo; only the creator can delete it.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { MemoSchema } from "@/lib/schemas/memo";
import { generateId } from "@/lib/utils";
import type { Database, UserSummaryRow } from "../db";
import { getDb, tripMemos, userSummaryColumns } from "../db";
import { ERROR_MESSAGES } from "../lib/errors";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

type MemoWithRelations = typeof tripMemos.$inferSelect & {
  creator: UserSummaryRow | null;
  updater: UserSummaryRow | null;
};

/**
 * Fetch a single memo with its creator and updater.
 */
async function findMemo(db: Database, memoId: string) {
  return db.query.tripMemos.findFirst({
    where: eq(tripMemos.id, memoId),
    with: {
      creator: { columns: userSummaryColumns },
      updater: { columns: userSummaryColumns },
    },
  });
}

const memoRouter = new Hono<TripMemberContext>()
  .use("*", requireSession(), requireMember)
  /**
   * GET /api/trips/:tripId/memo
   * List every memo for the trip, most recently updated first.
   */
  .get("/", async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    const items = await db.query.tripMemos.findMany({
      where: eq(tripMemos.tripId, tripId),
      orderBy: [desc(tripMemos.updatedAt)],
      with: {
        creator: { columns: userSummaryColumns },
        updater: { columns: userSummaryColumns },
      },
    });

    return c.json({ data: items as MemoWithRelations[] });
  })
  /**
   * POST /api/trips/:tripId/memo
   * Create a memo authored by the current user.
   */
  .post("/", zValidator("json", MemoSchema), async (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const tripId = c.get("tripId");
    const validated = c.req.valid("json");
    const db = getDb(c.env.DB);

    const memoId = generateId("memo");
    await db.insert(tripMemos).values({
      id: memoId,
      tripId,
      content: validated.content,
      createdBy: userId,
      updatedBy: userId,
    });

    const created = await findMemo(db, memoId);
    return c.json(created, 201);
  })
  /**
   * PUT /api/trips/:tripId/memo/:memoId
   * Update a memo's content (any trip member).
   */
  .put("/:memoId", zValidator("json", MemoSchema), async (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const tripId = c.get("tripId");
    const memoId = c.req.param("memoId");
    const validated = c.req.valid("json");
    const db = getDb(c.env.DB);

    const memo = await db.query.tripMemos.findFirst({
      where: and(eq(tripMemos.id, memoId), eq(tripMemos.tripId, tripId)),
    });
    if (!memo) {
      return c.json({ error: "メモが見つかりません" }, 404);
    }

    await db
      .update(tripMemos)
      .set({ content: validated.content, updatedBy: userId, updatedAt: Date.now() })
      .where(eq(tripMemos.id, memoId));

    const updated = await findMemo(db, memoId);
    return c.json(updated);
  })
  /**
   * DELETE /api/trips/:tripId/memo/:memoId
   * Delete a memo (creator only).
   */
  .delete("/:memoId", async (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const tripId = c.get("tripId");
    const memoId = c.req.param("memoId");
    const db = getDb(c.env.DB);

    const memo = await db.query.tripMemos.findFirst({
      where: and(eq(tripMemos.id, memoId), eq(tripMemos.tripId, tripId)),
    });
    if (!memo) {
      return c.json({ error: "メモが見つかりません" }, 404);
    }
    if (memo.createdBy !== userId) {
      return c.json({ error: ERROR_MESSAGES.FORBIDDEN }, 403);
    }

    await db.delete(tripMemos).where(eq(tripMemos.id, memoId));

    return c.json({ success: true });
  });

export default memoRouter;
