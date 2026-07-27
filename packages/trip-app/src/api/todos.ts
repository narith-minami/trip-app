/**
 * src/api/todos.ts
 *
 * Todos API query functions.
 */

import type { Todo, TodoComment, TodoPriority } from "@/types/entities";
import { apiClient } from "./client";

/**
 * Fetch todos for a trip
 */
export async function fetchTodos(tripId: string) {
  const res = await apiClient.api.trips[":tripId"].todos.$get({
    param: { tripId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch todos");
  }
  return res.json();
}

/**
 * Fetch a single todo with comments (detail view)
 */
export async function fetchTodoDetail(tripId: string, todoId: string) {
  const res = await apiClient.api.trips[":tripId"].todos[":todoId"].$get({
    param: { tripId, todoId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch todo detail");
  }
  return res.json() as Promise<Todo & { comments: TodoComment[] }>;
}

/**
 * Create todo
 */
export async function createTodo(
  tripId: string,
  data: {
    title: string;
    description?: string | null;
    dueDate?: string | null;
    assigneeId?: string;
    priority?: TodoPriority;
    tags?: string[];
  }
) {
  const res = await apiClient.api.trips[":tripId"].todos.$post({
    param: { tripId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to create todo");
  }
  return res.json();
}

/**
 * Update todo
 */
export async function updateTodo(
  tripId: string,
  todoId: string,
  data: Partial<{
    title: string;
    description: string | null;
    dueDate: string | null;
    isDone: boolean;
    assigneeId: string | null;
    priority: TodoPriority;
    tags: string[];
  }>
) {
  const res = await apiClient.api.trips[":tripId"].todos[":todoId"].$put({
    param: { tripId, todoId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to update todo");
  }
  return res.json();
}

/**
 * Delete todo
 */
export async function deleteTodo(tripId: string, todoId: string) {
  const res = await apiClient.api.trips[":tripId"].todos[":todoId"].$delete({
    param: { tripId, todoId },
  });
  if (!res.ok) {
    throw new Error("Failed to delete todo");
  }
  return res.json();
}
