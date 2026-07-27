/**
 * src/server/middleware/requireMember.ts
 *
 * Middleware to verify that the current user is a member of a specific trip.
 * Requires tripId to be available in route params.
 * Should be used after requireSession middleware.
 */

import { and, eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import type { TripMember } from "../db";
import { getDb } from "../db";
import { tripMembers } from "../db/schema";
import type { AuthContext } from "./auth";

/**
 * Extended context with trip member info
 */
export type TripMemberContext = AuthContext & {
  Variables: AuthContext["Variables"] & {
    tripMember: TripMember;
    tripId: string;
  };
};

/**
 * Middleware to ensure user is a member of the trip
 *
 * @param c - Hono context
 * @param next - Hono next function
 * @returns 403 if user is not a trip member, otherwise calls next
 */
export async function requireMember(
  c: Context<TripMemberContext>,
  next: Next
): Promise<Response | undefined> {
  // Get user from context using type casting
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Extract tripId from route params
  const tripId = c.req.param("tripId");

  if (!tripId) {
    return c.json({ error: "Trip ID is required" }, 400);
  }

  try {
    const db = getDb(c.env.DB);

    // Check if user is a member of this trip
    const member = await db.query.tripMembers.findFirst({
      where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, user.id)),
    });

    if (!member) {
      return c.json({ error: "Forbidden: Not a member of this trip" }, 403);
    }

    // Store member info in context for downstream handlers
    c.set("tripMember", member);
    c.set("tripId", tripId);

    await next();
  } catch (error) {
    console.error("requireMember middleware failed", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
