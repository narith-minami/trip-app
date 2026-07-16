/**
 * auth-schema.ts
 *
 * Better Auth managed tables (reference only, not for migrations).
 * Used for type-safe JOIN operations in queries.
 *
 * Note: These tables are auto-generated and managed by Better Auth.
 * This file provides Drizzle type definitions for interoperability.
 *
 * `users` is defined once in `./schema.ts` and shared with the trip
 * features (owner/assignee/author relations) — it is re-exported here
 * so Better Auth's adapter and the app query the same table definition.
 *
 * Better Auth's internal adapter always writes real `Date` instances for
 * createdAt/updatedAt/expiresAt fields (see internal-adapter.mjs), so these
 * columns use `{ mode: "timestamp_ms" }` for correct serialization to/from
 * the existing millisecond-integer columns. The physical column type is
 * unchanged, so no new migration is required.
 */

import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./schema";

export { users };

// ============================================================================
// Sessions Table (Better Auth)
// ============================================================================
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

// ============================================================================
// Accounts Table (Better Auth - OAuth providers)
// ============================================================================
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  providerId: text("providerId").notNull(),
  accountId: text("accountId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
});

// ============================================================================
// Verifications Table (Better Auth - email verification, etc.)
// ============================================================================
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
});

// ============================================================================
// Relations (for join operations)
// ============================================================================

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Type exports
// ============================================================================
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
