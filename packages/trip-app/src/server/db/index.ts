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

export type Database = ReturnType<typeof getDb>;
