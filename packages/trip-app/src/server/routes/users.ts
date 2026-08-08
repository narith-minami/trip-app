/**
 * src/server/routes/users.ts
 *
 * User API endpoints.
 * Handles user profile and session management.
 */

import { Hono } from "hono";
import { ERROR_MESSAGES } from "../lib/errors";
import type { AuthContext } from "../middleware/auth";
import { getUser, requireSession } from "../middleware/auth";

/**
 * GET /api/users/me
 * Get current user session info
 */
const usersRouter = new Hono<AuthContext>().get("/me", requireSession(), async (c) => {
  const user = getUser(c);

  if (!user) {
    return c.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, 401);
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
});

export default usersRouter;
