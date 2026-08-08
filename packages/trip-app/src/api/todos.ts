/**
 * src/api/todos.ts
 *
 * Todos API query functions.
 */

import type { Todo, TodoComment, TodoPriority } from "@/types/entities";
import { apiClient } from "./client";
import { unwrap, unwrapData } from "./unwrap";

/**
 * Fetch todos for a trip
 */
export async function fetchTodos(tripId: string) {
  return unwrapData(
    await apiClient.api.trips[":tripId"].todos.$get({
      param: { tripId },
    }),
    "Failed to fetch todos"
  );
}

/**
 * Fetch a single todo with comments (detail view)
 */
export async function fetchTodoDetail(tripId: string, todoId: string) {
  const data = await unwrap(
    await apiClient.api.trips[":tripId"].todos[":todoId"].$get({
      param: { tripId, todoId },
    }),
    "Failed to fetch todo detail"
  );
  return data as Todo & { comments: TodoComment[] };
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
  return unwrap(
    await apiClient.api.trips[":tripId"].todos.$post({
      param: { tripId },
      json: data,
    }),
    "Failed to create todo"
  );
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
  return unwrap(
    await apiClient.api.trips[":tripId"].todos[":todoId"].$put({
      param: { tripId, todoId },
      json: data,
    }),
    "Failed to update todo"
  );
}

/**
 * Delete todo
 */
export async function deleteTodo(tripId: string, todoId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].todos[":todoId"].$delete({
      param: { tripId, todoId },
    }),
    "Failed to delete todo"
  );
}
