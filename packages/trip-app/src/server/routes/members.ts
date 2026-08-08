/**
 * src/server/routes/members.ts
 *
 * Trip members API endpoints.
 * Handles member management for trips.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb, tripMembers, trips, userSummaryColumns } from "../db";
import { ERROR_MESSAGES } from "../lib/errors";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

/**
 * GET /api/trips/:tripId/members
 * List trip members
 */
const membersRouter = new Hono<TripMemberContext>()
  .get("/", requireSession(), requireMember, async (c) => {
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
   * Remove member (owner only)
   */
  .delete("/:memberId", requireSession(), requireMember, async (c) => {
    const userId = c.get("user")?.id ?? null;
    const tripId = c.get("tripId");
    const memberId = c.req.param("memberId");
    if (!memberId) {
      return c.json({ error: "メンバーIDが必要です" }, 400);
    }
    const db = getDb(c.env.DB);

    // Get trip to check ownership
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return c.json({ error: ERROR_MESSAGES.TRIP_NOT_FOUND }, 404);
    }

    // Only owner can remove members
    if (trip.ownerId !== userId) {
      return c.json({ error: ERROR_MESSAGES.FORBIDDEN }, 403);
    }

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
