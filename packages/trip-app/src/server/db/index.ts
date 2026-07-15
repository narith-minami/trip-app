/**
 * src/server/db/index.ts
 *
 * Database factory function and schema export for Drizzle ORM.
 * Provides getDb(env) function that returns a Drizzle instance
 * configured for Cloudflare D1 with full schema.
 */

import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type {
  NewScheduleItem,
  NewScrap,
  NewScrapTag,
  NewTodo,
  NewTrip,
  NewTripMember,
  NewTripMemo,
  ScheduleItem,
  Scrap,
  ScrapTag,
  Todo,
  Trip,
  TripMember,
  TripMemo,
  User,
} from "./schema";

export {
  scheduleItems,
  scraps,
  scrapTags,
  todos,
  tripMembers,
  tripMemos,
  trips,
} from "./schema";

/**
 * Get a Drizzle ORM instance for the given D1 database binding.
 *
 * @param db - Cloudflare D1 database binding from env
 * @returns Drizzle ORM instance with full schema
 */
export function getDb(db: D1Database) {
  return drizzle(db, { schema });
}

/**
 * Column selection for nested user relations (trip owner, member, assignee,
 * author) matching `UserSummary` in src/types/entities.ts. Keeps
 * `emailVerified`/`createdAt`/`updatedAt` — Better Auth-managed fields not
 * part of the public trip API contract — out of these responses.
 */
export const userSummaryColumns = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export type Database = ReturnType<typeof getDb>;
