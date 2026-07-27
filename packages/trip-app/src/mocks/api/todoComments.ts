/**
 * src/mocks/api/todoComments.ts
 *
 * Mock todo comments API. Chat-style discussion on a todo.
 * Owns the in-memory comment store so the todos mock detail view can read
 * from the same source of truth. Mirrors src/api/todoComments.ts (AGENTS.md #24).
 */

import type { TodoComment } from "@/types/entities";

const mockUser = { id: "user-1", name: "Dev User", email: "dev@example.com", image: null };
const otherUser = { id: "user-2", name: "Hanako", email: "hanako@example.com", image: null };
const now = Date.now();

const seed: TodoComment[] = [
  {
    id: "comment-1",
    todoId: "todo-1",
    authorId: "user-1",
    author: mockUser,
    content: "期限に余裕を持って準備しよう。",
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "comment-2",
    todoId: "todo-1",
    authorId: "user-2",
    author: otherUser,
    content: "私も確認しておきます！",
    createdAt: now - 1 * 24 * 60 * 60 * 1000,
    updatedAt: now - 1 * 24 * 60 * 60 * 1000,
  },
];

export const mockComments: TodoComment[] = structuredClone(seed);

/** Current mock session user id (matches MOCK_USER in src/mocks/seed.ts). */
const CURRENT_USER_ID = "user-1";

export async function createTodoComment(tripId: string, todoId: string, content: string) {
  void tripId;
  const ts = Date.now();
  const comment: TodoComment = {
    id: `comment-${ts}`,
    todoId,
    authorId: CURRENT_USER_ID,
    author: mockUser,
    content: content.trim(),
    createdAt: ts,
    updatedAt: ts,
  };
  mockComments.push(comment);
  return comment;
}

export async function deleteTodoComment(tripId: string, todoId: string, commentId: string) {
  void tripId;
  void todoId;
  const index = mockComments.findIndex((c) => c.id === commentId);
  if (index === -1) throw new Error(`Comment ${commentId} not found`);
  mockComments.splice(index, 1);
  return { success: true };
}
