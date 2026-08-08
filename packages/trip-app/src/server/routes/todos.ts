/**
 * src/server/routes/todos.ts
 *
 * Todos API endpoints.
 * Handles CRUD operations for trip todos, including optional assignee,
 * priority and free-form tags.
 */

import { zValidator } from "@hono/zod-validator";
import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { UpdateTodo } from "@/lib/schemas/todo";
import { CreateTodoSchema, UpdateTodoSchema } from "@/lib/schemas/todo";
import { generateId } from "@/lib/utils";
import type { Database } from "../db";
import { getDb, todoComments, todos, todoTags, userSummaryColumns } from "../db";
import { flattenTags, insertTagsStmt, uniqueTags } from "../lib/tags";
import { pickDefined } from "../lib/update";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

type TodoUpdateInput = Partial<typeof todos.$inferInsert>;

type TodoWithRelations = typeof todos.$inferSelect & {
  assignee?: unknown;
  tags: { todoId: string; tag: string }[];
  comments?: unknown;
};

type TodoDetailWithRelations = TodoWithRelations & {
  comments: (typeof todoComments.$inferSelect & { author?: unknown })[];
};

/**
 * Flatten the `todo_tags` join rows into a plain string[] for the client.
 * Strips the comments relation (only attached for the detail endpoint).
 */
function serialize(todo: TodoWithRelations) {
  const { comments: _comments, ...rest } = todo;
  return flattenTags(rest);
}

/**
 * Like {@link serialize} but keeps the comment timeline, which the detail view
 * renders inline (it never fetches comments separately).
 */
function serializeDetail(todo: TodoDetailWithRelations) {
  return flattenTags(todo);
}

/**
 * Fetch a single todo with its assignee and tags (no comments).
 */
async function findTodo(db: Database, todoId: string) {
  return db.query.todos.findFirst({
    where: eq(todos.id, todoId),
    with: { assignee: { columns: userSummaryColumns }, tags: true },
  });
}

/**
 * Fetch a single todo with assignee, tags and comments (for detail endpoint).
 */
async function findTodoDetail(db: Database, todoId: string) {
  return db.query.todos.findFirst({
    where: eq(todos.id, todoId),
    with: {
      assignee: { columns: userSummaryColumns },
      tags: true,
      comments: {
        orderBy: [asc(todoComments.createdAt)],
        with: { author: { columns: userSummaryColumns } },
      },
    },
  });
}

/**
 * Build the todo fields to update from validated input. `tags` is handled
 * separately (join table) and `isDone` maps boolean → 0/1.
 */
function buildTodoUpdate(validated: UpdateTodo): TodoUpdateInput {
  const { isDone, tags: _tags, ...rest } = validated;
  return {
    ...pickDefined(rest),
    ...(isDone !== undefined ? { isDone: isDone ? 1 : 0 } : {}),
    updatedAt: Date.now(),
  };
}

/**
 * Apply a validated update to a todo. When `tags` is provided, the tag set is
 * replaced wholesale (delete + insert) in the same atomic batch as the row
 * update; omitting `tags` leaves them untouched (e.g. a checkbox toggle).
 */
async function persistTodoUpdate(
  db: Database,
  todoId: string,
  validated: UpdateTodo
): Promise<void> {
  const updateTodo = db.update(todos).set(buildTodoUpdate(validated)).where(eq(todos.id, todoId));
  if (validated.tags === undefined) {
    await updateTodo;
    return;
  }
  const deleteTags = db.delete(todoTags).where(eq(todoTags.todoId, todoId));
  const tagStmt = insertTagsStmt(db, todoTags, uniqueTags(validated.tags), (tag) => ({
    todoId,
    tag,
  }));
  await (tagStmt
    ? db.batch([updateTodo, deleteTags, tagStmt])
    : db.batch([updateTodo, deleteTags]));
}

/**
 * GET /api/trips/:tripId/todos
 * List todos for a trip
 */
const todosRouter = new Hono<TripMemberContext>()
  .use("*", requireSession(), requireMember)
  .get("/", async (c) => {
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
  })
  /**
   * GET /api/trips/:tripId/todos/:todoId
   * Fetch a single todo with its assignee, tags and comments (detail view).
   */
  .get("/:todoId", async (c) => {
    const tripId = c.get("tripId");
    const todoId = c.req.param("todoId");
    const db = getDb(c.env.DB);

    const todo = await findTodoDetail(db, todoId);
    if (!todo || todo.tripId !== tripId) {
      return c.json({ error: "Todoが見つかりません" }, 404);
    }

    return c.json(serializeDetail(todo as TodoDetailWithRelations));
  })
  /**
   * POST /api/trips/:tripId/todos
   * Create a todo
   */
  .post("/", zValidator("json", CreateTodoSchema), async (c) => {
    const tripId = c.get("tripId");
    const validated = c.req.valid("json");

    const db = getDb(c.env.DB);
    const todoId = generateId("todo");
    const tags = uniqueTags(validated.tags);

    const insertTodo = db.insert(todos).values({
      id: todoId,
      tripId,
      title: validated.title,
      description: validated.description ?? null,
      dueDate: validated.dueDate ?? null,
      assigneeId: validated.assigneeId,
      priority: validated.priority,
    });

    // Bulk-insert tags in a single batch with the todo for atomicity
    // and to avoid N+1 round trips (AGENTS.md #4/#8).
    const tagStmt = insertTagsStmt(db, todoTags, tags, (tag) => ({ todoId, tag }));
    await (tagStmt ? db.batch([insertTodo, tagStmt]) : insertTodo);

    const created = await findTodo(db, todoId);
    if (!created) {
      return c.json({ error: "作成されたTodoの取得に失敗しました" }, 500);
    }

    return c.json(serialize(created as TodoWithRelations), 201);
  })
  /**
   * PUT /api/trips/:tripId/todos/:todoId
   * Update a todo (checkbox toggle, priority, assignee, tags)
   */
  .put("/:todoId", zValidator("json", UpdateTodoSchema), async (c) => {
    const tripId = c.get("tripId");
    const todoId = c.req.param("todoId");
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
  })
  /**
   * DELETE /api/trips/:tripId/todos/:todoId
   * Delete a todo (and its tags)
   */
  .delete("/:todoId", async (c) => {
    const tripId = c.get("tripId");
    const todoId = c.req.param("todoId");
    const db = getDb(c.env.DB);

    // Verify todo belongs to trip
    const todo = await db.query.todos.findFirst({
      where: and(eq(todos.id, todoId), eq(todos.tripId, tripId)),
    });

    if (!todo) {
      return c.json({ error: "Todoが見つかりません" }, 404);
    }

    await db.batch([
      db.delete(todoComments).where(eq(todoComments.todoId, todoId)),
      db.delete(todoTags).where(eq(todoTags.todoId, todoId)),
      db.delete(todos).where(eq(todos.id, todoId)),
    ]);

    return c.json({ success: true });
  });

export default todosRouter;
