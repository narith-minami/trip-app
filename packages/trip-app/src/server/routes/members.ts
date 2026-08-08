/**
 * src/server/routes/members.ts
 *
 * Trip members API endpoints.
 * Handles member management for trips.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb, tripMembers, userSummaryColumns } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember, requireOwner } from "../middleware/requireMember";

/**
 * GET /api/trips/:tripId/members
 * List trip members
 */
const membersRouter = new Hono<TripMemberContext>()
  .use("*", requireSession(), requireMember)
  .get("/", async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    const members = await db.query.tripMembers.findMany({
      where: eq(tripMembers.tripId, tripId),
      with: {
        user: { columns: userSummaryColumns },
      },
    });

    return c.json({ data: members });
  })
  /**
   * DELETE /api/trips/:tripId/members/:memberId
   * Remove member (owner only, via requireOwner)
   */
  .delete("/:memberId", requireOwner, async (c) => {
    const tripId = c.get("tripId");
    const memberId = c.req.param("memberId");
    if (!memberId) {
      return c.json({ error: "メンバーIDが必要です" }, 400);
    }
    const db = getDb(c.env.DB);

    // Cannot remove owner
    const member = await db.query.tripMembers.findFirst({
      where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, memberId)),
    });

    if (!member) {
      return c.json({ error: "メンバーが見つかりません" }, 404);
    }

    if (member.role === "owner") {
      return c.json({ error: "旅行のオーナーは削除できません" }, 400);
    }

    await db
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, memberId)));

    return c.json({ success: true });
  });

export default membersRouter;
