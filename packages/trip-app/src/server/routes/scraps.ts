/**
 * src/server/routes/scraps.ts
 *
 * Scrap API endpoints.
 * Standalone "anything memo" — NOT tied to a trip. Any authenticated user can
 * read every scrap; only the author can edit or delete their own.
 */

import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { CreateScrapSchema, UpdateScrapSchema } from "@/lib/schemas/scrap";
import { generateId } from "@/lib/utils";
import { getDb, scraps, scrapTags } from "../db";
import type { AuthContext } from "../middleware/auth";
import { requireSession } from "../middleware/auth";

const ERR_INTERNAL = "内部サーバーエラー";

type Db = ReturnType<typeof getDb>;

type ScrapWithRelations = typeof scraps.$inferSelect & {
  author: unknown;
  tags: { scrapId: string; tag: string }[];
};

/**
 * Flatten the `scrap_tags` join rows into a plain string[] for the client.
 */
function serialize(scrap: ScrapWithRelations) {
  const { tags, ...rest } = scrap;
  return { ...rest, tags: tags.map((t) => t.tag) };
}

/**
 * Normalize a body string: return null for blank input so optional text can be
 * cleared (AGENTS.md #1), otherwise keep the original value verbatim.
 */
function normalizeContent(content: string | null | undefined): string | null {
  return content && content.trim().length > 0 ? content : null;
}

/**
 * Deduplicate incoming tags (already trimmed/validated by Zod).
 */
function uniqueTags(tags: string[] | undefined): string[] {
  return [...new Set(tags ?? [])];
}

/**
 * Build the bulk tag-insert statement, or null when there are no tags.
 */
function insertTagsStmt(db: Db, scrapId: string, tags: string[]) {
  if (tags.length === 0) return null;
  return db.insert(scrapTags).values(tags.map((tag) => ({ scrapId, tag })));
}

/**
 * Fetch a single scrap with its author and tags.
 */
async function findScrap(db: Db, scrapId: string) {
  return db.query.scraps.findFirst({
    where: eq(scraps.id, scrapId),
    with: { author: true, tags: true },
  });
}

type Guard =
  | { ok: true; scrap: typeof scraps.$inferSelect }
  | { ok: false; status: 403 | 404; error: string };

/**
 * Verify the scrap exists and belongs to the given user.
 */
async function authorizeOwner(db: Db, scrapId: string, userId: string): Promise<Guard> {
  const scrap = await db.query.scraps.findFirst({ where: eq(scraps.id, scrapId) });
  if (!scrap) return { ok: false, status: 404, error: "スクラップが見つかりません" };
  if (scrap.authorId !== userId) {
    return { ok: false, status: 403, error: "アクセスが拒否されました" };
  }
  return { ok: true, scrap };
}

const scrapsRouter = new Hono<AuthContext>()
  /**
   * GET /api/scraps
   * List every scrap (newest first). Filtering/search is done client-side.
   */
  .get("/", requireSession(), async (c) => {
    try {
      const db = getDb(c.env.DB);
      const items = await db.query.scraps.findMany({
        with: { author: true, tags: true },
        orderBy: [desc(scraps.createdAt)],
      });
      return c.json({ data: items.map((item) => serialize(item as ScrapWithRelations)) });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * POST /api/scraps
   * Create a scrap authored by the current user.
   */
  .post("/", requireSession(), zValidator("json", CreateScrapSchema), async (c) => {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "認証が必要です" }, 401);
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
      const tagStmt = insertTagsStmt(db, scrapId, tags);
      await (tagStmt ? db.batch([insertScrap, tagStmt]) : insertScrap);

      const created = await findScrap(db, scrapId);
      return c.json(created ? serialize(created as ScrapWithRelations) : null, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * PUT /api/scraps/:scrapId
   * Update a scrap (author only). Tags are fully replaced.
   */
  .put("/:scrapId", requireSession(), zValidator("json", UpdateScrapSchema), async (c) => {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "認証が必要です" }, 401);
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
      const tagStmt = insertTagsStmt(db, scrapId, tags);
      await (tagStmt
        ? db.batch([updateScrap, deleteTags, tagStmt])
        : db.batch([updateScrap, deleteTags]));

      const updated = await findScrap(db, scrapId);
      return c.json(updated ? serialize(updated as ScrapWithRelations) : null);
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * DELETE /api/scraps/:scrapId
   * Delete a scrap and its tags (author only).
   */
  .delete("/:scrapId", requireSession(), async (c) => {
    try {
      const userId = c.get("user")?.id;
      if (!userId) {
        return c.json({ error: "認証が必要です" }, 401);
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
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default scrapsRouter;
