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
import { accounts, sessions, users, verifications } from "../db/auth-schema";
import type { Env } from "../env";
import { sendPasswordResetEmail } from "../lib/email";

/**
 * The 4 Drizzle table models Better Auth's adapter reads/writes.
 * `users` is the single shared definition also used by the trip features
 * (see src/server/db/schema.ts) — exported so the mapping can be
 * unit-tested without a live database.
 */
export const authDrizzleSchema = {
  user: users,
  session: sessions,
  account: accounts,
  verification: verifications,
};

/**
 * Create and export Better Auth instance
 * Should be configured per-request with env bindings
 */
export function createAuth(env: Env) {
  const db = getDb(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: authDrizzleSchema,
    }),
    secret: env.AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      // `url` points at Better Auth's own /reset-password/:token endpoint,
      // which validates the token server-side and redirects the browser to
      // our `redirectTo` page (see requestPasswordReset's `redirectTo`
      // param) with `?token=` on success or `?error=INVALID_TOKEN` on
      // failure — building the link by hand would skip that validation.
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail(env, { to: user.email, resetUrl: url });
      },
    },
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          socialProviders: {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
          },
        }
      : {}),
  });
}

/**
 * Type for Better Auth instance
 */
export type Auth = ReturnType<typeof createAuth>;
