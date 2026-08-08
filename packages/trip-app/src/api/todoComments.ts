/**
 * src/api/todoComments.ts
 *
 * Todo comments API query functions. Mirrors the Hono comments router mounted
 * at /api/trips/:tripId/todos/:todoId/comments. Comments are always read as
 * part of the todo detail payload (see fetchTodoDetail), so this only wraps
 * the write endpoints.
 */

import { apiClient } from "./client";
import { unwrap } from "./unwrap";

/**
 * Create a comment on a todo as the current session user.
 */
export async function createTodoComment(tripId: string, todoId: string, content: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].todos[":todoId"].comments.$post({
      param: { tripId, todoId },
      json: { content },
    }),
    "Failed to create todo comment"
  );
}

/**
 * Delete a comment. Only the author may delete their own comment (server
 * enforces ownership).
 */
export async function deleteTodoComment(tripId: string, todoId: string, commentId: string) {
  return unwrap(
    await apiClient.api.trips[":tripId"].todos[":todoId"].comments[":commentId"].$delete({
      param: { tripId, todoId, commentId },
    }),
    "Failed to delete todo comment"
  );
}
