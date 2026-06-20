/**
 * auth-schema.ts
 *
 * Better Auth managed tables (reference only, not for migrations).
 * Used for type-safe JOIN operations in queries.
 *
 * Note: These tables are auto-generated and managed by Better Auth.
 * This file provides Drizzle type definitions for interoperability.
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// Users Table (Better Auth)
// ============================================================================
export const authUsers = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified").notNull().default(0),
  image: text("image"),
  createdAt: integer("createdAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Sessions Table (Better Auth)
// ============================================================================
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Accounts Table (Better Auth - OAuth providers)
// ============================================================================
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  providerId: text("providerId").notNull(), // "google", etc.
  accountId: text("accountId").notNull(), // provider-specific ID (Google sub)
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  createdAt: integer("createdAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Verifications Table (Better Auth - email verification, etc.)
// ============================================================================
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt").notNull(),
  createdAt: integer("createdAt"),
  updatedAt: integer("updatedAt"),
});

// ============================================================================
// Relations (for join operations)
// ============================================================================

export const authUsersRelations = relations(authUsers, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(authUsers, {
    fields: [sessions.userId],
    references: [authUsers.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(authUsers, {
    fields: [accounts.userId],
    references: [authUsers.id],
  }),
}));

// ============================================================================
// Type exports
// ============================================================================
export type AuthUser = typeof authUsers.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
