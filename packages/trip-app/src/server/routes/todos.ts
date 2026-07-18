/**
 * src/server/routes/todos.ts
 *
 * Todos API endpoints.
 * Handles CRUD operations for trip todos, including optional assignee,
 * priority and free-form tags.
 */

import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { TodoTagsSchema } from "@/lib/schemas/todo";
import { TODO_PRIORITY_KEYS } from "@/lib/todoPriority";
import { generateId } from "@/lib/utils";
import { getDb, todos, todoTags, userSummaryColumns } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

type Db = ReturnType<typeof getDb>;

// Schemas for todos
const CreateTodoSchema = z.object({
  title: z.string().min(1),
  assigneeId: z.string().optional(),
  priority: z.enum(TODO_PRIORITY_KEYS).optional(),
  tags: TodoTagsSchema.optional(),
});

const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  isDone: z.boolean().optional(),
  assigneeId: z.string().optional().nullable(),
  priority: z.enum(TODO_PRIORITY_KEYS).optional(),
  tags: TodoTagsSchema.optional(),
});

const ERR_INTERNAL = "内部サーバーエラー";

type TodoUpdateInput = Partial<typeof todos.$inferInsert>;

type TodoWithRelations = typeof todos.$inferSelect & {
  assignee?: unknown;
  tags: { todoId: string; tag: string }[];
};

/**
 * Flatten the `todo_tags` join rows into a plain string[] for the client.
 */
function serialize(todo: TodoWithRelations) {
  const { tags, ...rest } = todo;
  return { ...rest, tags: tags.map((t) => t.tag) };
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
function insertTagsStmt(db: Db, todoId: string, tags: string[]) {
  if (tags.length === 0) return null;
  return db.insert(todoTags).values(tags.map((tag) => ({ todoId, tag })));
}

/**
 * Fetch a single todo with its assignee and tags.
 */
async function findTodo(db: Db, todoId: string) {
  return db.query.todos.findFirst({
    where: eq(todos.id, todoId),
    with: { assignee: { columns: userSummaryColumns }, tags: true },
  });
}

/**
 * Build the todo fields to update from validated input.
 */
function buildTodoUpdate(validated: z.infer<typeof UpdateTodoSchema>): TodoUpdateInput {
  const updateData: TodoUpdateInput = { updatedAt: Date.now() };
  if (validated.title) updateData.title = validated.title;
  if (validated.isDone !== undefined) updateData.isDone = validated.isDone ? 1 : 0;
  if (validated.assigneeId !== undefined) updateData.assigneeId = validated.assigneeId;
  if (validated.priority !== undefined) updateData.priority = validated.priority;
  return updateData;
}

/**
 * Apply a validated update to a todo. When `tags` is provided, the tag set is
 * replaced wholesale (delete + insert) in the same atomic batch as the row
 * update; omitting `tags` leaves them untouched (e.g. a checkbox toggle).
 */
async function persistTodoUpdate(
  db: Db,
  todoId: string,
  validated: z.infer<typeof UpdateTodoSchema>
): Promise<void> {
  const updateTodo = db.update(todos).set(buildTodoUpdate(validated)).where(eq(todos.id, todoId));
  if (validated.tags === undefined) {
    await updateTodo;
    return;
  }
  const deleteTags = db.delete(todoTags).where(eq(todoTags.todoId, todoId));
  const tagStmt = insertTagsStmt(db, todoId, uniqueTags(validated.tags));
  await (tagStmt
    ? db.batch([updateTodo, deleteTags, tagStmt])
    : db.batch([updateTodo, deleteTags]));
}

/**
 * GET /api/trips/:tripId/todos
 * List todos for a trip
 */
const todosRouter = new Hono<TripMemberContext>()
  .get("/", requireSession(), requireMember, async (c) => {
    try {
      const tripId = c.get("tripId");
      const db = getDb(c.env.DB);

      const items = await db.query.todos.findMany({
        where: eq(todos.tripId, tripId),
        with: {
          assignee: { columns: userSummaryColumns },
          tags: true,
        },
      });

      return c.json({ data: items.map((item) => serialize(item as TodoWithRelations)) });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * POST /api/trips/:tripId/todos
   * Create a todo
   */
  .post("/", requireSession(), requireMember, zValidator("json", CreateTodoSchema), async (c) => {
    try {
      const tripId = c.get("tripId");
      const validated = c.req.valid("json");

      const db = getDb(c.env.DB);
      const todoId = generateId("todo");
      const tags = uniqueTags(validated.tags);

      const insertTodo = db.insert(todos).values({
        id: todoId,
        tripId,
        title: validated.title,
        assigneeId: validated.assigneeId,
        priority: validated.priority ?? "medium",
      });

      // Bulk-insert tags in a single batch with the todo for atomicity
      // and to avoid N+1 round trips (AGENTS.md #4/#8).
      const tagStmt = insertTagsStmt(db, todoId, tags);
      await (tagStmt ? db.batch([insertTodo, tagStmt]) : insertTodo);

      const created = await findTodo(db, todoId);
      if (!created) {
        return c.json({ error: "作成されたTodoの取得に失敗しました" }, 500);
      }

      return c.json(serialize(created as TodoWithRelations), 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * PUT /api/trips/:tripId/todos/:todoId
   * Update a todo (checkbox toggle, priority, assignee, tags)
   */
  .put(
    "/:todoId",
    requireSession(),
    requireMember,
    zValidator("json", UpdateTodoSchema),
    async (c) => {
      try {
        const tripId = c.get("tripId");
        const todoId = c.req.param("todoId");
        if (!todoId) {
          return c.json({ error: "TodoのIDが必要です" }, 400);
        }
        const validated = c.req.valid("json");

        const db = getDb(c.env.DB);

        // Verify todo belongs to trip
        const todo = await db.query.todos.findFirst({
          where: and(eq(todos.id, todoId), eq(todos.tripId, tripId)),
        });

        if (!todo) {
          return c.json({ error: "Todoが見つかりません" }, 404);
        }

        await persistTodoUpdate(db, todoId, validated);

        const updated = await findTodo(db, todoId);
        if (!updated) {
          return c.json({ error: "更新されたTodoの取得に失敗しました" }, 500);
        }

        return c.json(serialize(updated as TodoWithRelations));
      } catch (error) {
        if (error instanceof Error && error.message.includes("validation")) {
          return c.json({ error: error.message }, 400);
        }
        return c.json({ error: ERR_INTERNAL }, 500);
      }
    }
  )
  /**
   * DELETE /api/trips/:tripId/todos/:todoId
   * Delete a todo (and its tags)
   */
  .delete("/:todoId", requireSession(), requireMember, async (c) => {
    try {
      const tripId = c.get("tripId");
      const todoId = c.req.param("todoId");
      if (!todoId) {
        return c.json({ error: "TodoのIDが必要です" }, 400);
      }
      const db = getDb(c.env.DB);

      // Verify todo belongs to trip
      const todo = await db.query.todos.findFirst({
        where: and(eq(todos.id, todoId), eq(todos.tripId, tripId)),
      });

      if (!todo) {
        return c.json({ error: "Todoが見つかりません" }, 404);
      }

      await db.batch([
        db.delete(todoTags).where(eq(todoTags.todoId, todoId)),
        db.delete(todos).where(eq(todos.id, todoId)),
      ]);

      return c.json({ success: true });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default todosRouter;
