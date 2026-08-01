/**
 * src/server/routes/invite.ts
 *
 * Invite link API endpoints.
 * Lets a visitor preview a trip by invite token and join it once authenticated.
 */

import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getDb, tripMembers, trips } from "../db";
import type { AuthContext } from "../middleware/auth";
import { requireSession } from "../middleware/auth";

const ERR_INTERNAL = "内部サーバーエラー";
const ERR_INVALID_TOKEN = "招待リンクが無効です";

/**
 * GET /api/invite/:token
 * Public preview of the trip behind an invite token (no auth required).
 */
const inviteRouter = new Hono<AuthContext>()
  .get("/:token", async (c) => {
    try {
      const token = c.req.param("token");
      if (!token) {
        return c.json({ error: ERR_INVALID_TOKEN }, 404);
      }
      const db = getDb(c.env.DB);

      const trip = await db.query.trips.findFirst({
        where: eq(trips.inviteToken, token),
        with: { members: true },
      });

      if (!trip) {
        return c.json({ error: ERR_INVALID_TOKEN }, 404);
      }

      return c.json({
        tripId: trip.id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        memberCount: trip.members.length,
      });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * POST /api/invite/:token/join
   * Join the trip behind an invite token as the current user.
   */
  .post("/:token/join", requireSession(), async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      if (!userId) {
        return c.json({ error: "認証が必要です" }, 401);
      }

      const token = c.req.param("token");
      if (!token) {
        return c.json({ error: ERR_INVALID_TOKEN }, 404);
      }
      const db = getDb(c.env.DB);

      const trip = await db.query.trips.findFirst({
        where: eq(trips.inviteToken, token),
      });

      if (!trip) {
        return c.json({ error: ERR_INVALID_TOKEN }, 404);
      }

      const existingMember = await db.query.tripMembers.findFirst({
        where: and(eq(tripMembers.tripId, trip.id), eq(tripMembers.userId, userId)),
      });

      if (existingMember) {
        return c.json({ error: "既にこの旅行に参加しています", tripId: trip.id }, 409);
      }

      await db.insert(tripMembers).values({
        tripId: trip.id,
        userId,
        role: "member",
      });

      return c.json({ tripId: trip.id }, 201);
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default inviteRouter;
