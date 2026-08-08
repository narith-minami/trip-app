/**
 * src/server/routes/facilities.ts
 *
 * Facility/spot API endpoints.
 * Handles CRUD operations for reusable trip facilities (hotels, restaurants, ...).
 */

import { zValidator } from "@hono/zod-validator";
import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { generateId } from "@/lib/utils";
import { facilities, getDb, scheduleItems } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";
import { searchFacilitiesByKeyword } from "../services/facilitySearch";

const ERR_NOT_FOUND = "施設が見つかりません";
const ERR_SEARCH_UNAVAILABLE = "施設検索機能は現在利用できません";
const ERR_SEARCH_FAILED = "施設検索に失敗しました";

const FACILITY_CATEGORY_VALUES = [
  "hotel",
  "restaurant",
  "sightseeing",
  "shopping",
  "transport",
  "other",
] as const;

const CreateFacilitySchema = z.object({
  category: z.enum(FACILITY_CATEGORY_VALUES),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  businessHours: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  memo: z.string().nullable().optional(),
});

const UpdateFacilitySchema = CreateFacilitySchema.partial();

const SearchQuerySchema = z.object({
  q: z.string().min(1),
});

type FacilityUpdateInput = Partial<typeof facilities.$inferInsert>;

/**
 * Build the facility fields to update from validated input.
 * `!== undefined` checks let callers explicitly clear nullable fields.
 */
function buildFacilityUpdate(
  validated: z.infer<typeof UpdateFacilitySchema>,
  userId: string | null
): FacilityUpdateInput {
  const updateData: FacilityUpdateInput = {
    updatedBy: userId,
    updatedAt: Date.now(),
  };
  if (validated.category !== undefined) updateData.category = validated.category;
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.address !== undefined) updateData.address = validated.address;
  if (validated.lat !== undefined) updateData.lat = validated.lat;
  if (validated.lng !== undefined) updateData.lng = validated.lng;
  if (validated.phone !== undefined) updateData.phone = validated.phone;
  if (validated.businessHours !== undefined) updateData.businessHours = validated.businessHours;
  if (validated.url !== undefined) updateData.url = validated.url;
  if (validated.memo !== undefined) updateData.memo = validated.memo;
  return updateData;
}

/**
 * GET /api/trips/:tripId/facilities
 * List facilities for a trip, grouped by category on the client.
 */
const facilitiesRouter = new Hono<TripMemberContext>()
  .get("/", requireSession(), requireMember, async (c) => {
    const tripId = c.get("tripId");
    const db = getDb(c.env.DB);

    const items = await db.query.facilities.findMany({
      where: eq(facilities.tripId, tripId),
      orderBy: [asc(facilities.category), asc(facilities.createdAt)],
    });

    return c.json({ data: items });
  })
  /**
   * GET /api/trips/:tripId/facilities/search?q=...
   * Search external facility info (name/address/phone/coordinates) via YOLP.
   * Must be registered before "/:facilityId" so "search" isn't captured as an ID.
   */
  .get(
    "/search",
    requireSession(),
    requireMember,
    zValidator("query", SearchQuerySchema),
    async (c) => {
      const appId = c.env.YAHOO_CLIENT_ID;
      if (!appId) {
        return c.json({ error: ERR_SEARCH_UNAVAILABLE }, 503);
      }
      try {
        const { q } = c.req.valid("query");
        const results = await searchFacilitiesByKeyword(q, appId);
        return c.json({ data: results });
      } catch (_error) {
        return c.json({ error: ERR_SEARCH_FAILED }, 502);
      }
    }
  )
  /**
   * GET /api/trips/:tripId/facilities/:facilityId
   * Get a single facility's detail.
   */
  .get("/:facilityId", requireSession(), requireMember, async (c) => {
    const tripId = c.get("tripId");
    const facilityId = c.req.param("facilityId");
    if (!facilityId) {
      return c.json({ error: "施設IDが必要です" }, 400);
    }

    const db = getDb(c.env.DB);
    const facility = await db.query.facilities.findFirst({
      where: and(eq(facilities.id, facilityId), eq(facilities.tripId, tripId)),
    });

    if (!facility) {
      return c.json({ error: ERR_NOT_FOUND }, 404);
    }

    return c.json(facility);
  })
  /**
   * POST /api/trips/:tripId/facilities
   * Create a facility.
   */
  .post(
    "/",
    requireSession(),
    requireMember,
    zValidator("json", CreateFacilitySchema),
    async (c) => {
      const userId = c.get("user")?.id ?? null;
      const tripId = c.get("tripId");
      const validated = c.req.valid("json");

      const db = getDb(c.env.DB);
      const facilityId = generateId("facility");

      await db.insert(facilities).values({
        id: facilityId,
        tripId,
        category: validated.category,
        name: validated.name,
        address: validated.address,
        lat: validated.lat,
        lng: validated.lng,
        phone: validated.phone,
        businessHours: validated.businessHours,
        url: validated.url,
        memo: validated.memo,
        updatedBy: userId,
      });

      const created = await db.query.facilities.findFirst({
        where: eq(facilities.id, facilityId),
      });

      return c.json(created, 201);
    }
  )
  /**
   * PUT /api/trips/:tripId/facilities/:facilityId
   * Update a facility.
   */
  .put(
    "/:facilityId",
    requireSession(),
    requireMember,
    zValidator("json", UpdateFacilitySchema),
    async (c) => {
      const userId = c.get("user")?.id ?? null;
      const tripId = c.get("tripId");
      const facilityId = c.req.param("facilityId");
      if (!facilityId) {
        return c.json({ error: "施設IDが必要です" }, 400);
      }
      const validated = c.req.valid("json");

      const db = getDb(c.env.DB);

      const existing = await db.query.facilities.findFirst({
        where: and(eq(facilities.id, facilityId), eq(facilities.tripId, tripId)),
      });

      if (!existing) {
        return c.json({ error: ERR_NOT_FOUND }, 404);
      }

      const updateData = buildFacilityUpdate(validated, userId);
      await db.update(facilities).set(updateData).where(eq(facilities.id, facilityId));

      const updated = await db.query.facilities.findFirst({
        where: eq(facilities.id, facilityId),
      });

      return c.json(updated);
    }
  )
  /**
   * DELETE /api/trips/:tripId/facilities/:facilityId
   * Delete a facility and unlink it from any schedule items that reference it.
   */
  .delete("/:facilityId", requireSession(), requireMember, async (c) => {
    const tripId = c.get("tripId");
    const facilityId = c.req.param("facilityId");
    if (!facilityId) {
      return c.json({ error: "施設IDが必要です" }, 400);
    }

    const db = getDb(c.env.DB);

    const existing = await db.query.facilities.findFirst({
      where: and(eq(facilities.id, facilityId), eq(facilities.tripId, tripId)),
    });

    if (!existing) {
      return c.json({ error: ERR_NOT_FOUND }, 404);
    }

    await db.batch([
      db
        .update(scheduleItems)
        .set({ facilityId: null })
        .where(eq(scheduleItems.facilityId, facilityId)),
      db.delete(facilities).where(eq(facilities.id, facilityId)),
    ]);

    return c.json({ success: true });
  });

export default facilitiesRouter;
