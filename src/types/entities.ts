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

export interface ScheduleItem {
  id: string;
  tripId: string;
  date: string; // YYYY-MM-DD
  startTime?: string | null; // HH:MM
  title: string;
  placeName?: string | null;
  placeUrl?: string | null;
  memo?: string | null;
  imageUrl?: string | null;
  orderIndex: number;
  updatedBy?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Todo {
  id: string;
  tripId: string;
  title: string;
  isDone: number; // 0 | 1
  assigneeId?: string | null;
  assignee?: UserSummary | null;
  createdAt: number;
  updatedAt: number;
}

export interface TripMemo {
  tripId: string;
  content: string;
  updatedBy?: string | null;
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
