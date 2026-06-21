/**
 * src/server/middleware/auth.ts
 *
 * Authentication middleware for Hono.
 * Extracts session from request headers and makes it available in context.
 * Requires valid session or returns 401 Unauthorized.
 */

import type { Context, Next } from "hono";
import type { Env } from "../env";

/**
 * Session object from Better Auth
 */
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
  updatedAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: number;
    updatedAt: number;
  };
}

/**
 * Extended context type with session and user
 */
export type AuthContext = {
  Variables: {
    session: Session | null;
    user: Session["user"] | null;
  };
  Bindings: Env;
};

/**
 * Middleware to require and extract session from request.
 *
 * Attempts to extract session from Authorization header (Bearer token).
 * Sets 'session' and 'user' in context for downstream handlers.
 *
 * @returns Hono middleware function
 */
export function requireSession() {
  return async (c: Context<AuthContext>, next: Next): Promise<Response | undefined> => {
    // Extract Bearer token from Authorization header
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/, "");

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: In a real implementation, validate the token with Better Auth
    // For now, set placeholder values. This will be replaced with actual
    // session retrieval from Better Auth API.
    try {
      // This is where you would call:
      // const session = await auth.api.getSession({ headers: c.req.raw.headers });
      //
      // For now, we'll await proper auth.ts setup

      c.set("session", null);
      c.set("user", null);
      await next();
    } catch {
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
}

/**
 * Get session from context (requires requireSession middleware).
 * Generic over the context env so contexts that extend AuthContext
 * (e.g. TripMemberContext) can be passed without casting.
 */
export function getSession<E extends AuthContext>(c: Context<E>): Session | null {
  return c.get("session") ?? null;
}

/**
 * Get user from context (requires requireSession middleware)
 */
export function getUser<E extends AuthContext>(c: Context<E>): Session["user"] | null {
  return c.get("user") ?? null;
}

/**
 * Get user ID from context (requires requireSession middleware)
 */
export function getUserId<E extends AuthContext>(c: Context<E>): string | null {
  const user = c.get("user");
  return user?.id ?? null;
}
