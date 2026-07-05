/**
 * src/server/routes/todos.ts
 *
 * Todos API endpoints.
 * Handles CRUD operations for trip todos.
 */

import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { generateId } from "@/lib/utils";
import { getDb, todos } from "../db";
import { requireSession } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";
import { requireMember } from "../middleware/requireMember";

// Schemas for todos
const CreateTodoSchema = z.object({
  title: z.string().min(1),
  assigneeId: z.string().optional(),
});

const UpdateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  isDone: z.boolean().optional(),
  assigneeId: z.string().optional().nullable(),
});

const ERR_INTERNAL = "内部サーバーエラー";

type TodoUpdateInput = Partial<typeof todos.$inferInsert>;

/**
 * Build the todo fields to update from validated input.
 */
function buildTodoUpdate(validated: z.infer<typeof UpdateTodoSchema>): TodoUpdateInput {
  const updateData: TodoUpdateInput = { updatedAt: Date.now() };
  if (validated.title) updateData.title = validated.title;
  if (validated.isDone !== undefined) updateData.isDone = validated.isDone ? 1 : 0;
  if (validated.assigneeId !== undefined) updateData.assigneeId = validated.assigneeId;
  return updateData;
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
          assignee: true,
        },
      });

      return c.json({ data: items });
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

      await db.insert(todos).values({
        id: todoId,
        tripId,
        title: validated.title,
        assigneeId: validated.assigneeId,
      });

      const created = await db.query.todos.findFirst({
        where: eq(todos.id, todoId),
        with: {
          assignee: true,
        },
      });

      return c.json(created, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes("validation")) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  })
  /**
   * PUT /api/trips/:tripId/todos/:todoId
   * Update a todo (checkbox toggle)
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

        const updateData = buildTodoUpdate(validated);

        await db.update(todos).set(updateData).where(eq(todos.id, todoId));

        const updated = await db.query.todos.findFirst({
          where: eq(todos.id, todoId),
          with: {
            assignee: true,
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
   * DELETE /api/trips/:tripId/todos/:todoId
   * Delete a todo
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

      await db.delete(todos).where(eq(todos.id, todoId));

      return c.json({ success: true });
    } catch (_error) {
      return c.json({ error: ERR_INTERNAL }, 500);
    }
  });

export default todosRouter;
