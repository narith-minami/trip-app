/**
 * src/server/routes/users.ts
 *
 * User API endpoints.
 * Handles user profile and session management.
 */

import { Hono } from "hono";
import { requireSession, getUser } from "../middleware/auth";
import type { AuthContext } from "../middleware/auth";

const usersRouter = new Hono<AuthContext>();

/**
 * GET /api/users/me
 * Get current user session info
 */
usersRouter.get("/me", requireSession(), async (c) => {
  try {
    const user = getUser(c);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
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
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default usersRouter;
