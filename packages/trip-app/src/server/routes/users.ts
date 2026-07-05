/**
 * src/server/routes/users.ts
 *
 * User API endpoints.
 * Handles user profile and session management.
 */

import { Hono } from "hono";
import type { AuthContext } from "../middleware/auth";
import { getUser, requireSession } from "../middleware/auth";

/**
 * GET /api/users/me
 * Get current user session info
 */
const usersRouter = new Hono<AuthContext>().get("/me", requireSession(), async (c) => {
  try {
    const user = getUser(c);

    if (!user) {
      return c.json({ error: "認証が必要です" }, 401);
    }

    return c.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (_error) {
    return c.json({ error: "内部サーバーエラー" }, 500);
  }
});

export default usersRouter;
