/**
 * src/server/routes/todos.ts
 *
 * Todos API endpoints.
 * Handles CRUD operations for trip todos.
 */

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb, todos } from "../db";
import { requireSession, getUserId } from "../middleware/auth";
import { requireMember } from "../middleware/requireMember";
import { generateId } from "@/lib/utils";
import { z } from "zod";
import type { AuthContext } from "../middleware/auth";
import type { TripMemberContext } from "../middleware/requireMember";

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

const todosRouter = new Hono<TripMemberContext>();

/**
 * GET /api/trips/:tripId/todos
 * List todos for a trip
 */
todosRouter.get("/", requireSession(), requireMember, async (c) => {
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
  } catch (error) {
    console.error("Error fetching todos:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/trips/:tripId/todos
 * Create a todo
 */
todosRouter.post("/", requireSession(), requireMember, async (c) => {
  try {
    const tripId = c.get("tripId");
    const body = await c.req.json();
    const validated = CreateTodoSchema.parse(body);

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
    console.error("Error creating todo:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * PUT /api/trips/:tripId/todos/:todoId
 * Update a todo (checkbox toggle)
 */
todosRouter.put("/:todoId", requireSession(), requireMember, async (c) => {
  try {
    const tripId = c.get("tripId");
    const todoId = c.req.param("todoId");
    const body = await c.req.json();
    const validated = UpdateTodoSchema.parse(body);

    const db = getDb(c.env.DB);

    // Verify todo belongs to trip
    const todo = await db.query.todos.findFirst({
      where: and(eq(todos.id, todoId), eq(todos.tripId, tripId)),
    });

    if (!todo) {
      return c.json({ error: "Todo not found" }, 404);
    }

    const updateData: any = {};
    if (validated.title) updateData.title = validated.title;
    if (validated.isDone !== undefined) updateData.isDone = validated.isDone ? 1 : 0;
    if (validated.assigneeId !== undefined) updateData.assigneeId = validated.assigneeId;
    updateData.updatedAt = new Date().getTime();

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
    console.error("Error updating todo:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * DELETE /api/trips/:tripId/todos/:todoId
 * Delete a todo
 */
todosRouter.delete("/:todoId", requireSession(), requireMember, async (c) => {
  try {
    const tripId = c.get("tripId");
    const todoId = c.req.param("todoId");
    const db = getDb(c.env.DB);

    // Verify todo belongs to trip
    const todo = await db.query.todos.findFirst({
      where: and(eq(todos.id, todoId), eq(todos.tripId, tripId)),
    });

    if (!todo) {
      return c.json({ error: "Todo not found" }, 404);
    }

    await db.delete(todos).where(eq(todos.id, todoId));

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default todosRouter;
