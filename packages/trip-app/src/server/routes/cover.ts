/**
 * src/server/routes/cover.ts
 *
 * Cover photo API endpoints.
 * Handles cover image uploads to R2 and database updates.
 * Mounted at /api/trips/:tripId/cover. Owner-only via `requireOwner`.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { generateId } from "@/lib/utils";
import { getDb, trips } from "../db";
import { uploadImage } from "../lib/upload";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember, requireOwner } from "../middleware/requireMember";

/**
 * POST /api/trips/:tripId/cover
 * Upload cover photo to R2 and update trip
 */
const coverRouter = new Hono<TripMemberContext>().post(
  "/",
  requireSession(),
  requireMember,
  requireOwner,
  async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    const result = await uploadImage({
      formData: await c.req.formData(),
      bucket: c.env.R2,
      buildKey: (extension) => `${tripId}-${generateId("cover")}.${extension}`,
    });

    if (!result.ok) {
      return c.json({ error: result.message }, result.status);
    }

    // Update trip with R2 key. RETURNING gives the stored row back
    // without a second round trip.
    const [updated] = await db
      .update(trips)
      .set({ coverImageUrl: result.key })
      .where(eq(trips.id, tripId))
      .returning();

    return c.json(updated);
  }
);

export default coverRouter;
