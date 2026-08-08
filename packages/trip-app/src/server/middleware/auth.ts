import type { Context, Next } from "hono";
import type { Env } from "../env";
import { ERROR_MESSAGES } from "../lib/errors";
import { createAuth } from "../routes/auth";

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

export type AuthContext = {
  Variables: {
    session: Session | null;
    user: Session["user"] | null;
  };
  Bindings: Env;
};

/**
 * Better Auth always returns createdAt/updatedAt/expiresAt as `Date`
 * instances. The app's public API contract exposes these as millisecond
 * epoch numbers, so convert at this boundary.
 */
function toSessionUser(user: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Session["user"] {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? undefined,
    createdAt: user.createdAt.getTime(),
    updatedAt: user.updatedAt.getTime(),
  };
}

export function requireSession() {
  return async (c: Context<AuthContext>, next: Next): Promise<Response | undefined> => {
    try {
      const auth = createAuth(c.env);
      const sessionData = await auth.api.getSession({ headers: c.req.raw.headers });

      if (!sessionData?.user) {
        return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
      }

      const { session, user } = sessionData;
      const sessionUser = toSessionUser(user);

      c.set("session", {
        id: session.id,
        userId: session.userId,
        token: session.token,
        expiresAt: session.expiresAt.getTime(),
        ipAddress: session.ipAddress ?? undefined,
        userAgent: session.userAgent ?? undefined,
        createdAt: session.createdAt.getTime(),
        updatedAt: session.updatedAt.getTime(),
        user: sessionUser,
      });
      c.set("user", sessionUser);
      await next();
    } catch (_error) {
      return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
    }
  };
}
