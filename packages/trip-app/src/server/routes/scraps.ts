/**
 * src/server/routes/scraps.ts
 *
 * Scrap API endpoints.
 * Standalone "anything memo" — NOT tied to a trip. Any authenticated user can
 * read every scrap; only the author can edit or delete their own.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { CreateScrapSchema, UpdateScrapSchema } from "@/lib/schemas/scrap";
import { generateId } from "@/lib/utils";
import type { Database, UserSummaryRow } from "../db";
import { getDb, scraps, scrapTags, userSummaryColumns } from "../db";
import { ERROR_MESSAGES } from "../lib/errors";
import { flattenTags, insertTagsStmt, uniqueTags } from "../lib/tags";
import type { AuthContext } from "../middleware/auth";
import { requireSession } from "../middleware/auth";

type ScrapWithRelations = typeof scraps.$inferSelect & {
  author: UserSummaryRow | null;
  tags: { scrapId: string; tag: string }[];
};

/**
 * Normalize a body string: return null for blank input so optional text can be
 * cleared (AGENTS.md #1), otherwise keep the original value verbatim.
 */
function normalizeContent(content: string | null | undefined): string | null {
  return content && content.trim().length > 0 ? content : null;
}

/**
 * Fetch a single scrap with its author and tags.
 */
async function findScrap(db: Database, scrapId: string) {
  return db.query.scraps.findFirst({
    where: eq(scraps.id, scrapId),
    with: { author: { columns: userSummaryColumns }, tags: true },
  });
}

type Guard =
  | { ok: true; scrap: typeof scraps.$inferSelect }
  | { ok: false; status: 403 | 404; error: string };

/**
 * Verify the scrap exists and belongs to the given user.
 */
async function authorizeOwner(db: Database, scrapId: string, userId: string): Promise<Guard> {
  const scrap = await db.query.scraps.findFirst({ where: eq(scraps.id, scrapId) });
  if (!scrap) return { ok: false, status: 404, error: "スクラップが見つかりません" };
  if (scrap.authorId !== userId) {
    return { ok: false, status: 403, error: ERROR_MESSAGES.FORBIDDEN };
  }
  return { ok: true, scrap };
}

const scrapsRouter = new Hono<AuthContext>()
  /**
   * GET /api/scraps
   * List every scrap (newest first). Filtering/search is done client-side.
   */
  .get("/", requireSession(), async (c) => {
    const db = getDb(c.env.DB);
    const items = await db.query.scraps.findMany({
      with: { author: { columns: userSummaryColumns }, tags: true },
      orderBy: [desc(scraps.createdAt)],
    });
    return c.json({ data: items.map((item) => flattenTags(item as ScrapWithRelations)) });
  })
  /**
   * POST /api/scraps
   * Create a scrap authored by the current user.
   */
  .post("/", requireSession(), zValidator("json", CreateScrapSchema), async (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const validated = c.req.valid("json");
    const db = getDb(c.env.DB);

    const scrapId = generateId("scrap");
    const tags = uniqueTags(validated.tags);

    const insertScrap = db.insert(scraps).values({
      id: scrapId,
      content: normalizeContent(validated.content),
      imageData: validated.imageData ?? null,
      authorId: userId,
    });

    // Bulk-insert tags in a single batch with the scrap for atomicity
    // and to avoid N+1 round trips (AGENTS.md #4/#8).
    const tagStmt = insertTagsStmt(db, scrapTags, tags, (tag) => ({ scrapId, tag }));
    await (tagStmt ? db.batch([insertScrap, tagStmt]) : insertScrap);

    const created = await findScrap(db, scrapId);
    return c.json(created ? flattenTags(created as ScrapWithRelations) : null, 201);
  })
  /**
   * PUT /api/scraps/:scrapId
   * Update a scrap (author only). Tags are fully replaced.
   */
  .put("/:scrapId", requireSession(), zValidator("json", UpdateScrapSchema), async (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const scrapId = c.req.param("scrapId");
    if (!scrapId) {
      return c.json({ error: "スクラップのIDが必要です" }, 400);
    }
    const validated = c.req.valid("json");
    const db = getDb(c.env.DB);

    const guard = await authorizeOwner(db, scrapId, userId);
    if (!guard.ok) {
      return c.json({ error: guard.error }, guard.status);
    }

    const tags = uniqueTags(validated.tags);
    const updateScrap = db
      .update(scraps)
      .set({
        content: normalizeContent(validated.content),
        imageData: validated.imageData ?? null,
        updatedAt: Date.now(),
      })
      .where(eq(scraps.id, scrapId));
    const deleteTags = db.delete(scrapTags).where(eq(scrapTags.scrapId, scrapId));

    // Replace body + tags atomically in one batch.
    const tagStmt = insertTagsStmt(db, scrapTags, tags, (tag) => ({ scrapId, tag }));
    await (tagStmt
      ? db.batch([updateScrap, deleteTags, tagStmt])
      : db.batch([updateScrap, deleteTags]));

    const updated = await findScrap(db, scrapId);
    return c.json(updated ? flattenTags(updated as ScrapWithRelations) : null);
  })
  /**
   * DELETE /api/scraps/:scrapId
   * Delete a scrap and its tags (author only).
   */
  .delete("/:scrapId", requireSession(), async (c) => {
    const userId = c.get("user")?.id;
    if (!userId) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const scrapId = c.req.param("scrapId");
    if (!scrapId) {
      return c.json({ error: "スクラップのIDが必要です" }, 400);
    }
    const db = getDb(c.env.DB);

    const guard = await authorizeOwner(db, scrapId, userId);
    if (!guard.ok) {
      return c.json({ error: guard.error }, guard.status);
    }

    await db.batch([
      db.delete(scrapTags).where(eq(scrapTags.scrapId, scrapId)),
      db.delete(scraps).where(eq(scraps.id, scrapId)),
    ]);

    return c.json({ success: true });
  });

export default scrapsRouter;
