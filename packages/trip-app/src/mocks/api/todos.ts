/**
 * src/mocks/api/todos.ts
 *
 * Mock todos API. CRUD operations on todos.
 */

import type { Todo, TodoComment, TodoPriority } from "@/types/entities";
import { mockComments } from "./todoComments";

const mockUser = { id: "user-1", name: "Dev User", email: "dev@example.com", image: null };
const now = Date.now();

type MockTodo = Todo & {
  assignee: typeof mockUser | null;
  description: string | null;
  dueDate: string | null;
  comments: TodoComment[];
};

const mockTodos: MockTodo[] = [
  {
    id: "todo-1",
    tripId: "trip-1",
    title: "パスポート確認",
    description: "有効期限と残ページ数をチェックする。",
    dueDate: "2025-08-15",
    isDone: 1,
    assigneeId: "user-1",
    assignee: mockUser,
    priority: "high",
    tags: ["持ち物"],
    comments: [],
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    updatedAt: now - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "todo-2",
    tripId: "trip-1",
    title: "ホテルの予約確認",
    description: null,
    dueDate: null,
    isDone: 1,
    assigneeId: "user-1",
    assignee: mockUser,
    priority: "medium",
    tags: ["ホテル"],
    comments: [],
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "todo-3",
    tripId: "trip-1",
    title: "成田エクスプレスのチケット購入",
    description: null,
    dueDate: null,
    isDone: 0,
    assigneeId: null,
    assignee: null,
    priority: "high",
    tags: ["移動"],
    comments: [],
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
];

const todos = structuredClone(mockTodos);

export async function fetchTodos(tripId: string) {
  const items = todos
    .filter((t) => t.tripId === tripId)
    // List view does not need comments; strip them to keep payloads light.
    .map(({ comments: _comments, ...rest }) => rest);
  return { data: items };
}

export async function fetchTodoDetail(tripId: string, todoId: string) {
  const todo = todos.find((t) => t.id === todoId && t.tripId === tripId);
  if (!todo) throw new Error(`Todo ${todoId} not found`);
  const { comments: _comments, ...rest } = todo;
  return {
    ...structuredClone(rest),
    // Source comments from the shared store so new comments appear in detail.
    comments: structuredClone(
      mockComments.filter((c) => c.todoId === todoId).sort((a, b) => a.createdAt - b.createdAt)
    ),
  };
}

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
  const newTodo: MockTodo = {
    id: `todo-${Date.now()}`,
    tripId,
    title: data.title,
    description: data.description?.trim() || null,
    dueDate: data.dueDate || null,
    isDone: 0,
    assigneeId: data.assigneeId ?? null,
    assignee: data.assigneeId === "user-1" ? mockUser : null,
    priority: data.priority ?? "medium",
    tags: [...new Set(data.tags ?? [])],
    comments: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  todos.push(newTodo);
  const { comments: _comments, ...rest } = newTodo;
  return rest;
}

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
  const todo = todos.find((t) => t.id === todoId && t.tripId === tripId);
  if (!todo) throw new Error(`Todo ${todoId} not found`);

  applyTodoUpdate(todo, data);
  todo.updatedAt = Date.now();

  const { comments: _comments, ...rest } = todo;
  return rest;
}

function applyTodoUpdate(
  todo: MockTodo,
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
  if (data.title !== undefined) todo.title = data.title;
  if (data.description !== undefined) todo.description = data.description;
  if (data.dueDate !== undefined) todo.dueDate = data.dueDate;
  if (data.isDone !== undefined) todo.isDone = data.isDone ? 1 : 0;
  if (data.priority !== undefined) todo.priority = data.priority;
  if (data.tags !== undefined) todo.tags = [...new Set(data.tags)];
  if (data.assigneeId !== undefined) applyAssignee(todo, data.assigneeId);
}

function applyAssignee(todo: MockTodo, assigneeId: string | null) {
  todo.assigneeId = assigneeId;
  todo.assignee = assigneeId === "user-1" ? mockUser : null;
}

export async function deleteTodo(tripId: string, todoId: string) {
  const index = todos.findIndex((t) => t.id === todoId && t.tripId === tripId);
  if (index === -1) throw new Error(`Todo ${todoId} not found`);

  todos.splice(index, 1);
  return { success: true };
}
