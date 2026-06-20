/**
 * src/server/routes/cover.ts
 *
 * Cover photo API endpoints.
 * Handles cover image uploads to R2 and database updates.
 */

import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, trips } from "../db";
import { requireSession, getUserId } from "../middleware/auth";
import { generateId } from "@/lib/utils";
import type { AuthContext } from "../middleware/auth";

const coverRouter = new Hono<AuthContext>();

/**
 * POST /api/trips/:tripId/cover
 * Upload cover photo to R2 and update trip
 */
coverRouter.post("/:tripId", requireSession(), async (c) => {
  try {
    const userId = getUserId(c as any);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tripId = c.req.param("tripId");
    const db = getDb(c.env.DB);

    // Get trip
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return c.json({ error: "Trip not found" }, 404);
    }

    // Only owner can update cover
    if (trip.ownerId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Get file from form data
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "File must be an image" }, 400);
    }

    // Upload to R2
    const buffer = await file.arrayBuffer();
    const fileName = `${tripId}-${generateId("cover")}.${file.type.split("/")[1]}`;

    try {
      await c.env.R2.put(fileName, buffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });
    } catch (error) {
      console.error("Error uploading to R2:", error);
      return c.json({ error: "Failed to upload image" }, 500);
    }

    // Update trip with R2 key
    await db.update(trips).set({ coverImageUrl: fileName }).where(eq(trips.id, tripId));

    const updated = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    return c.json(updated);
  } catch (error) {
    console.error("Error uploading cover:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default coverRouter;
