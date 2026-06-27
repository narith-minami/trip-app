/**
 * src/server/routes/members.ts
 *
 * Trip members API endpoints.
 * Handles member management for trips.
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb, tripMembers, trips } from "../db";
import { requireSession } from "../middleware/auth";
import { requireMember } from "../middleware/requireMember";
import type { TripMemberContext } from "../middleware/requireMember";

/**
 * GET /api/trips/:tripId/members
 * List trip members
 */
const membersRouter = new Hono<TripMemberContext>()
  .get("/", requireSession(), requireMember, async (c) => {
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
      return c.json({ error: "内部サーバーエラー" }, 500);
    }
  })
  /**
   * DELETE /api/trips/:tripId/members/:memberId
   * Remove member (owner only)
   */
  .delete("/:memberId", requireSession(), requireMember, async (c) => {
    try {
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
        return c.json({ error: "旅行が見つかりません" }, 404);
      }

      // Only owner can remove members
      if (trip.ownerId !== userId) {
        return c.json({ error: "アクセスが拒否されました" }, 403);
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
    } catch (error) {
      console.error("Error removing member:", error);
      return c.json({ error: "内部サーバーエラー" }, 500);
    }
  });

export default membersRouter;
