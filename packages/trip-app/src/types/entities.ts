/**
 * src/types/entities.ts
 *
 * Client-facing entity shapes returned by the trip API.
 * Mirrors the server Drizzle schema without importing server code,
 * keeping the architecture boundary between client and server intact.
 */

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface Trip {
  id: string;
  title: string;
  destination?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  ownerId: string;
  inviteToken: string;
  coverImageUrl?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduleItemImage {
  id: string;
  scheduleItemId: string;
  imageUrl: string;
  orderIndex: number;
  createdAt: number;
}

export interface ScheduleItem {
  id: string;
  tripId: string;
  date: string; // YYYY-MM-DD
  startTime?: string | null; // HH:MM
  endTime?: string | null; // HH:MM
  title: string;
  eventType?: string | null;
  placeName?: string | null;
  placeUrl?: string | null;
  memo?: string | null;
  images: ScheduleItemImage[];
  orderIndex: number;
  updatedBy?: string | null;
  createdAt: number;
  updatedAt: number;
}

export type TodoPriority = "high" | "medium" | "low";

export interface Todo {
  id: string;
  tripId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null; // YYYY-MM-DD
  isDone: number; // 0 | 1
  assigneeId?: string | null;
  assignee?: UserSummary | null;
  priority: TodoPriority;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TodoComment {
  id: string;
  todoId: string;
  authorId: string;
  author?: UserSummary | null;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface TripMemo {
  tripId: string;
  content: string;
  updatedBy?: string | null;
  updatedAt: number;
}

export interface Scrap {
  id: string;
  content?: string | null;
  imageData?: string | null; // base64 data URL
  authorId: string;
  author?: UserSummary | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type TripMemberRole = "owner" | "member";

export interface TripMember {
  tripId: string;
  userId: string;
  role: TripMemberRole;
  joinedAt: number;
  user?: UserSummary | null;
}
