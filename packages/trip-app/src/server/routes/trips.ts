/**
 * src/server/routes/trips.ts
 *
 * Trip management API endpoints.
 * Handles CRUD operations for trips with proper access control.
 */

import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { CreateTripSchema, UpdateTripSchema } from "@/lib/schemas/trip";
import { generateId } from "@/lib/utils";
import { getDb, tripMembers, trips, userSummaryColumns } from "../db";
import type { AuthContext } from "../middleware/auth";
import { requireSession } from "../middleware/auth";

const ERR_UNAUTHORIZED = "認証が必要です";
const ERR_FORBIDDEN = "アクセスが拒否されました";
const ERR_INTERNAL = "内部サーバーエラー";
const ERR_TRIP_ID_REQUIRED = "旅行IDが必要です";

type TripUpdateInput = Partial<typeof trips.$inferInsert>;

/**
 * Build the set of fields to update from validated input, skipping
 * undefined values so untouched columns are left unchanged.
 *
 * Note: `description` has no column on the `trips` table (it maps to
 * `destination` via `location`), so it is intentionally not persisted.
 * `location` uses an explicit `!== undefined` check so it can be cleared.
 */
function buildTripUpdate(validated: {
  title?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}): TripUpdateInput {
  const updateData: TripUpdateInput = { updatedAt: Date.now() };
  if (validated.title) updateData.title = validated.title;
  if (validated.startDate) updateData.startDate = validated.startDate;
  if (validated.endDate) updateData.endDate = validated.endDate;
  if (validated.location !== undefined) updateData.destination = validated.location;
  return updateData;
}

/**
 * GET /api/trips
 * List trips for the current user
 */
const tripsRouter = new Hono<AuthContext>()
  .get("/", requireSession(), async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      if (!userId) {
        return c.json({ error: ERR_UNAUTHORIZED }, 401);
      }

      const db = getDb(c.env.DB);

      // Get all trips where user is a member
      const userTrips = await db
        .select({
          tripId: tripMembers.tripId,
        })
        .from(tripMembers)
        .where(eq(tripMembers.userId, userId));

      if (userTrips.length === 0) {
        return c.json({ data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
      }

      const tripIds = userTrips.map((t) => t.tripId);

      // Get trip details with owner info
      const tripsData = await db.query.trips.findMany({
        where: (trips, { inArray }) => inArray(trips.id, tripIds),
        orderBy: desc(trips.createdAt),
        with: {
          owner: { columns: userSummaryColumns },
          members: {
            with: {
              user: { columns: userSummaryColumns },
            },
          },
        },
      });

      const total = tripsData.length;
      const pages = Math.ceil(total / 20);

      return c.json({
        data: tripsData.map((trip) => ({
          id: trip.id,
          title: trip.title,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          coverImageUrl: trip.coverImageUrl,
          ownerId: trip.ownerId,
          owner: trip.owner,
          members: trip.members,
          inviteToken: trip.inviteToken,
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt,
        })),
        pagination: {
          page: 1,
          limit: 20,
          total,
          pages,
        },
      });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * POST /api/trips
   * Create a new trip
   */
  .post("/", requireSession(), zValidator("json", CreateTripSchema), async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      if (!userId) {
        return c.json({ error: ERR_UNAUTHORIZED }, 401);
      }

      const validated = c.req.valid("json");

      const db = getDb(c.env.DB);
      const tripId = generateId("trip");
      const inviteToken = generateId("invite");

      // Create trip
      await db.insert(trips).values({
        id: tripId,
        title: validated.title,
        destination: validated.location,
        startDate: validated.startDate,
        endDate: validated.endDate,
        ownerId: userId,
        inviteToken,
      });

      // Add owner as first member
      await db.insert(tripMembers).values({
        tripId,
        userId,
        role: "owner",
      });

      // Fetch and return the created trip
      const createdTrip = await db.query.trips.findFirst({
        where: eq(trips.id, tripId),
        with: {
          owner: { columns: userSummaryColumns },
          members: {
            with: {
              user: { columns: userSummaryColumns },
            },
          },
        },
      });

      return c.json(createdTrip, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * GET /api/trips/:tripId
   * Get trip detail
   */
  .get("/:tripId", requireSession(), async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      if (!userId) {
        return c.json({ error: ERR_UNAUTHORIZED }, 401);
      }

      const tripId = c.req.param("tripId");
      if (!tripId) {
        return c.json({ error: ERR_TRIP_ID_REQUIRED }, 400);
      }
      const db = getDb(c.env.DB);

      // Check membership
      const member = await db.query.tripMembers.findFirst({
        where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)),
      });

      if (!member) {
        return c.json({ error: ERR_FORBIDDEN }, 403);
      }

      const trip = await db.query.trips.findFirst({
        where: eq(trips.id, tripId),
        with: {
          owner: { columns: userSummaryColumns },
          members: {
            with: {
              user: { columns: userSummaryColumns },
            },
          },
        },
      });

      if (!trip) {
        return c.json({ error: "旅行が見つかりません" }, 404);
      }

      return c.json(trip);
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * PUT /api/trips/:tripId
   * Update trip
   */
  .put(
    "/:tripId",
    requireSession(),
    zValidator("json", UpdateTripSchema.omit({ id: true })),
    async (c) => {
      try {
        const userId = c.get("user")?.id ?? null;
        if (!userId) {
          return c.json({ error: ERR_UNAUTHORIZED }, 401);
        }

        const tripId = c.req.param("tripId");
        if (!tripId) {
          return c.json({ error: ERR_TRIP_ID_REQUIRED }, 400);
        }
        const validated = c.req.valid("json");

        const db = getDb(c.env.DB);

        // Check membership
        const member = await db.query.tripMembers.findFirst({
          where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)),
        });

        if (!member) {
          return c.json({ error: ERR_FORBIDDEN }, 403);
        }

        // Update trip
        const updateData = buildTripUpdate(validated);

        await db.update(trips).set(updateData).where(eq(trips.id, tripId));

        const updated = await db.query.trips.findFirst({
          where: eq(trips.id, tripId),
          with: {
            owner: { columns: userSummaryColumns },
            members: {
              with: {
                user: { columns: userSummaryColumns },
              },
            },
          },
        });

        return c.json(updated);
      } catch (error) {
        if (error instanceof Error && error.message.includes("validation")) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: ERR_INTERNAL }, 500);
      }
    }
  )
  /**
   * DELETE /api/trips/:tripId
   * Delete trip (owner only)
   */
  .delete("/:tripId", requireSession(), async (c) => {
    try {
      const userId = c.get("user")?.id ?? null;
      if (!userId) {
        return c.json({ error: ERR_UNAUTHORIZED }, 401);
      }

      const tripId = c.req.param("tripId");
      if (!tripId) {
        return c.json({ error: ERR_TRIP_ID_REQUIRED }, 400);
      }
      const db = getDb(c.env.DB);

      // Get trip
      const trip = await db.query.trips.findFirst({
        where: eq(trips.id, tripId),
      });

      if (!trip) {
        return c.json({ error: "旅行が見つかりません" }, 404);
      }

      // Only owner can delete
      if (trip.ownerId !== userId) {
        return c.json({ error: ERR_FORBIDDEN }, 403);
      }

      // Delete trip
      await db.delete(trips).where(eq(trips.id, tripId));

      return c.json({ success: true });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default tripsRouter;
