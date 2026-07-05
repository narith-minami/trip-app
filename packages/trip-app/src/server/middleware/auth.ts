import type { Context, Next } from "hono";
import type { Env } from "../env";
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

export function requireSession() {
  return async (c: Context<AuthContext>, next: Next): Promise<Response | undefined> => {
    try {
      const auth = createAuth(c.env);
      const sessionData = await auth.api.getSession({ headers: c.req.raw.headers });

      if (!sessionData?.user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      c.set("session", sessionData.session as unknown as Session);
      c.set("user", sessionData.user as unknown as Session["user"]);
      await next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
}

export function getSession(c: Context<AuthContext>): Session | null {
  return c.get("session") ?? null;
}

export function getUser(c: Context<AuthContext>): Session["user"] | null {
  return c.get("user") ?? null;
}

export function getUserId(c: Context<AuthContext>): string | null {
  const user = c.get("user");
  return user?.id ?? null;
}
