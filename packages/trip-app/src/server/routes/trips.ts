/**
 * src/server/routes/trips.ts
 *
 * Trip management API endpoints.
 * Handles CRUD operations for trips with proper access control.
 * `/:tripId` routes are guarded by `requireMember` (membership) and, for
 * destructive operations, `requireOwner`.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { CreateTripSchema, UpdateTripSchema } from "@/lib/schemas/trip";
import { generateId } from "@/lib/utils";
import { getDb, tripMembers, trips, userSummaryColumns } from "../db";
import { ERROR_MESSAGES } from "../lib/errors";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";
import { requireOwner } from "../middleware/requireOwner";

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
  coverImageUrl?: string | null;
}): TripUpdateInput {
  const updateData: TripUpdateInput = { updatedAt: Date.now() };
  if (validated.title) updateData.title = validated.title;
  if (validated.startDate) updateData.startDate = validated.startDate;
  if (validated.endDate) updateData.endDate = validated.endDate;
  if (validated.location !== undefined) updateData.destination = validated.location;
  if (validated.coverImageUrl !== undefined) updateData.coverImageUrl = validated.coverImageUrl;
  return updateData;
}

/** Shared relation shape: trip with owner and member users embedded. */
const withOwnerAndMembers = {
  owner: { columns: userSummaryColumns },
  members: {
    with: {
      user: { columns: userSummaryColumns },
    },
  },
} as const;

const tripsRouter = new Hono<TripMemberContext>()
  // Membership guard for all single-trip routes. List/create ("/") only
  // require a session and keep their own requireSession() below.
  .use("/:tripId", requireSession(), requireMember)
  /**
   * GET /api/trips
   * List trips for the current user
   */
  .get("/", requireSession(), async (c) => {
    const userId = c.get("user")?.id ?? null;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
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
      with: withOwnerAndMembers,
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
  })
  /**
   * POST /api/trips
   * Create a new trip
   */
  .post("/", requireSession(), zValidator("json", CreateTripSchema), async (c) => {
    const userId = c.get("user")?.id ?? null;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }

    const validated = c.req.valid("json");

    const db = getDb(c.env.DB);
    const tripId = generateId("trip");
    const inviteToken = generateId("invite");

    // Create the trip and its owner membership in one atomic batch —
    // a failure between the two would otherwise leave an orphan trip
    // unreachable by every membership-gated route.
    await db.batch([
      db.insert(trips).values({
        id: tripId,
        title: validated.title,
        destination: validated.location,
        startDate: validated.startDate,
        endDate: validated.endDate,
        ownerId: userId,
        inviteToken,
      }),
      db.insert(tripMembers).values({
        tripId,
        userId,
        role: "owner",
      }),
    ]);

    // Fetch and return the created trip
    const createdTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: withOwnerAndMembers,
    });

    return c.json(createdTrip, 201);
  })
  /**
   * GET /api/trips/:tripId
   * Get trip detail (members only, via requireMember)
   */
  .get("/:tripId", async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: withOwnerAndMembers,
    });

    if (!trip) {
      return c.json({ error: ERROR_MESSAGES.TRIP_NOT_FOUND }, 404);
    }

    return c.json(trip);
  })
  /**
   * PUT /api/trips/:tripId
   * Update trip (members only, via requireMember)
   */
  .put("/:tripId", zValidator("json", UpdateTripSchema.omit({ id: true })), async (c) => {
    const tripId = c.get("tripId");
    const validated = c.req.valid("json");

    const db = getDb(c.env.DB);

    // Update trip
    const updateData = buildTripUpdate(validated);

    await db.update(trips).set(updateData).where(eq(trips.id, tripId));

    const updated = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      with: withOwnerAndMembers,
    });

    return c.json(updated);
  })
  /**
   * DELETE /api/trips/:tripId
   * Delete trip (owner only, via requireOwner)
   */
  .delete("/:tripId", requireOwner, async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    await db.delete(trips).where(eq(trips.id, tripId));

    return c.json({ success: true });
  });

export default tripsRouter;
