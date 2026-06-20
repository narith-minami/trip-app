/**
 * src/server/routes/members.ts
 *
 * Trip members API endpoints.
 * Handles member management for trips.
 */

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb, tripMembers, trips } from "../db";
import { requireSession, getUserId } from "../middleware/auth";
import { requireMember } from "../middleware/requireMember";
import type { AuthContext } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";

const membersRouter = new Hono<TripMemberContext>();

/**
 * GET /api/trips/:tripId/members
 * List trip members
 */
membersRouter.get("/", requireSession(), requireMember, async (c) => {
  try {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    const members = await db.query.tripMembers.findMany({
      where: eq(tripMembers.tripId, tripId),
      with: {
        user: true,
      },
    });

    return c.json({ data: members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * DELETE /api/trips/:tripId/members/:memberId
 * Remove member (owner only)
 */
membersRouter.delete("/:memberId", requireSession(), requireMember, async (c) => {
  try {
    const userId = getUserId(c as any);
    const tripId = c.get("tripId");
    const memberId = c.req.param("memberId");
    const db = getDb(c.env.DB);

    // Get trip to check ownership
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return c.json({ error: "Trip not found" }, 404);
    }

    // Only owner can remove members
    if (trip.ownerId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Cannot remove owner
    const member = await db.query.tripMembers.findFirst({
      where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, memberId)),
    });

    if (!member) {
      return c.json({ error: "Member not found" }, 404);
    }

    if (member.role === "owner") {
      return c.json({ error: "Cannot remove trip owner" }, 400);
    }

    await db
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, memberId)));

    return c.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default membersRouter;
