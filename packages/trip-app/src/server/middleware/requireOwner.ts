/**
 * src/server/middleware/requireOwner.ts
 *
 * Middleware to verify that the current user is the owner of the trip.
 * Must run after `requireMember`, which loads the member row into context —
 * checking `role` there avoids re-fetching the trip just to compare ownerId.
 */

import type { Context, Next } from "hono";
import { ERROR_MESSAGES } from "../lib/errors";
import type { TripMemberContext } from "./requireMember";

/**
 * Middleware to ensure user is the owner of the trip.
 *
 * @returns 403 if the current member is not the trip owner, otherwise calls next
 */
export async function requireOwner(
  c: Context<TripMemberContext>,
  next: Next
): Promise<Response | undefined> {
  const member = c.get("tripMember");

  if (!member || member.role !== "owner") {
    return c.json({ error: ERROR_MESSAGES.FORBIDDEN }, 403);
  }

  await next();
}
