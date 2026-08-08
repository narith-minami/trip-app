/**
 * src/server/routes/todoComments.ts
 *
 * Write endpoints for a single todo's comments (create/delete). All trip
 * members can post comments; only the author can delete their own. Comments
 * are always read embedded in the todo detail response (see
 * findTodoDetail/serializeDetail in ./todos.ts), so there's no GET here.
 * Mounted under `/api/trips/:tripId/todos/:todoId/comments` so
 * `requireMember` is inherited.
 * Unexpected errors propagate to the central `app.onError` handler.
 */

import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { TodoCommentContentSchema } from "@/lib/schemas/todo";
import { generateId } from "@/lib/utils";
import { getDb, todoComments, todos } from "../db";
import { ERROR_MESSAGES } from "../lib/errors";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

const CreateCommentSchema = z.object({
  content: TodoCommentContentSchema,
});

/**
 * Verify that the todo belongs to the given trip. Returns the todo row or null.
 */
async function findTodoInTrip(db: ReturnType<typeof getDb>, todoId: string, tripId: string) {
  return db.query.todos.findFirst({
    where: and(eq(todos.id, todoId), eq(todos.tripId, tripId)),
  });
}

const commentsRouter = new Hono<TripMemberContext>()
  .use("*", requireSession(), requireMember)
  /**
   * POST /api/trips/:tripId/todos/:todoId/comments
   * Create a comment as the current session user.
   */
  .post("/", zValidator("json", CreateCommentSchema), async (c) => {
    const tripId = c.get("tripId");
    const todoId = c.req.param("todoId");
    const user = c.get("user");
    if (!todoId) {
      return c.json({ error: "TodoのIDが必要です" }, 400);
    }
    if (!user) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const validated = c.req.valid("json");
    const db = getDb(c.env.DB);

    const todo = await findTodoInTrip(db, todoId, tripId);
    if (!todo) {
      return c.json({ error: "Todoが見つかりません" }, 404);
    }

    const commentId = generateId("todoComment");
    const now = Date.now();
    await db.insert(todoComments).values({
      id: commentId,
      todoId,
      authorId: user.id,
      content: validated.content,
      createdAt: now,
      updatedAt: now,
    });

    // The author is just the session user (a subset of it) — no need to
    // re-fetch the row we just inserted with a join to get it.
    return c.json(
      {
        id: commentId,
        todoId,
        authorId: user.id,
        content: validated.content,
        createdAt: now,
        updatedAt: now,
        author: { id: user.id, name: user.name, email: user.email, image: user.image },
      },
      201
    );
  })
  /**
   * DELETE /api/trips/:tripId/todos/:todoId/comments/:commentId
   * Delete a comment. Only the author may delete their own comment.
   */
  .delete("/:commentId", async (c) => {
    const tripId = c.get("tripId");
    const todoId = c.req.param("todoId");
    const commentId = c.req.param("commentId");
    const user = c.get("user");
    if (!todoId || !commentId) {
      return c.json({ error: "IDが必要です" }, 400);
    }
    if (!user) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
    const db = getDb(c.env.DB);

    const todo = await findTodoInTrip(db, todoId, tripId);
    if (!todo) {
      return c.json({ error: "Todoが見つかりません" }, 404);
    }

    const comment = await db.query.todoComments.findFirst({
      where: and(eq(todoComments.id, commentId), eq(todoComments.todoId, todoId)),
    });
    if (!comment) {
      return c.json({ error: "コメントが見つかりません" }, 404);
    }
    if (comment.authorId !== user.id) {
      return c.json({ error: "自分のコメントのみ削除できます" }, 403);
    }

    await db.delete(todoComments).where(eq(todoComments.id, commentId));
    return c.json({ success: true });
  });

export default commentsRouter;
