/**
 * src/server/routes/auth.ts
 *
 * Better Auth setup and configuration.
 * Configures OAuth providers (Google) and database adapter.
 * Exports auth instance for middleware and API route mounting.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "../db";
import { accounts, sessions, verifications } from "../db/auth-schema";
import * as schema from "../db/schema";
import type { Env } from "../env";

/**
 * Create and export Better Auth instance
 * Should be configured per-request with env bindings
 */
export function createAuth(env: Env) {
  const db = getDb(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: { ...schema, sessions, accounts, verifications },
    }),
    secret: env.AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
}

/**
 * Type for Better Auth instance
 */
export type Auth = ReturnType<typeof createAuth>;
