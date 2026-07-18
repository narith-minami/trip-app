/**
 * src/mocks/api/todos.ts
 *
 * Mock todos API. CRUD operations on todos.
 */

import type { Todo, TodoPriority } from "@/types/entities";

const mockUser = { id: "user-1", name: "Dev User", email: "dev@example.com", image: null };
const now = Date.now();

type MockTodo = Todo & { assignee: typeof mockUser | null };

const mockTodos: MockTodo[] = [
  {
    id: "todo-1",
    tripId: "trip-1",
    title: "パスポート確認",
    isDone: 1,
    assigneeId: "user-1",
    assignee: mockUser,
    priority: "high",
    tags: ["持ち物"],
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    updatedAt: now - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "todo-2",
    tripId: "trip-1",
    title: "ホテルの予約確認",
    isDone: 1,
    assigneeId: "user-1",
    assignee: mockUser,
    priority: "medium",
    tags: ["ホテル"],
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "todo-3",
    tripId: "trip-1",
    title: "成田エクスプレスのチケット購入",
    isDone: 0,
    assigneeId: null,
    assignee: null,
    priority: "high",
    tags: ["移動"],
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
];

const todos = structuredClone(mockTodos);

export async function fetchTodos(tripId: string) {
  const items = todos.filter((t) => t.tripId === tripId);
  return { data: items };
}

export async function createTodo(
  tripId: string,
  data: {
    title: string;
    assigneeId?: string;
    priority?: TodoPriority;
    tags?: string[];
  }
) {
  const newTodo: MockTodo = {
    id: `todo-${Date.now()}`,
    tripId,
    title: data.title,
    isDone: 0,
    assigneeId: data.assigneeId ?? null,
    assignee: data.assigneeId === "user-1" ? mockUser : null,
    priority: data.priority ?? "medium",
    tags: [...new Set(data.tags ?? [])],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  todos.push(newTodo);
  return newTodo;
}

export async function updateTodo(
  tripId: string,
  todoId: string,
  data: Partial<{
    title: string;
    isDone: boolean;
    assigneeId: string | null;
    priority: TodoPriority;
    tags: string[];
  }>
) {
  const todo = todos.find((t) => t.id === todoId && t.tripId === tripId);
  if (!todo) throw new Error(`Todo ${todoId} not found`);

  const updates: Record<string, unknown> = { ...data };
  if ("isDone" in data) {
    updates.isDone = data.isDone ? 1 : 0;
  }
  if ("assigneeId" in data && data.assigneeId) {
    updates.assignee = data.assigneeId === "user-1" ? mockUser : null;
  }
  if ("tags" in data && data.tags) {
    updates.tags = [...new Set(data.tags)];
  }

  Object.assign(todo, updates, { updatedAt: Date.now() });
  return todo;
}

export async function deleteTodo(tripId: string, todoId: string) {
  const index = todos.findIndex((t) => t.id === todoId && t.tripId === tripId);
  if (index === -1) throw new Error(`Todo ${todoId} not found`);

  todos.splice(index, 1);
  return { success: true };
}
