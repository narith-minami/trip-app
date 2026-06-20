/**
 * src/server/db/index.ts
 *
 * Database factory function and schema export for Drizzle ORM.
 * Provides getDb(env) function that returns a Drizzle instance
 * configured for Cloudflare D1 with full schema.
 */

import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

export type {
  Trip,
  NewTrip,
  TripMember,
  NewTripMember,
  ScheduleItem,
  NewScheduleItem,
  Todo,
  NewTodo,
  TripMemo,
  NewTripMemo,
  User,
} from "./schema";

export {
  trips,
  tripMembers,
  scheduleItems,
  todos,
  tripMemos,
  users,
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
