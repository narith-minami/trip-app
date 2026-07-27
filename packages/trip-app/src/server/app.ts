/**
 * src/server/app.ts
 *
 * Main Hono application server.
 * Assembles all routers and middleware.
 * Serves as the entry point for the Cloudflare Pages/Workers runtime.
 */

import { Hono } from "hono";
import type { Env } from "./env";
import { createAuth } from "./routes/auth";
import coverRouter from "./routes/cover";
import membersRouter from "./routes/members";
import memoRouter from "./routes/memo";
import scheduleRouter from "./routes/schedule";
import scrapsRouter from "./routes/scraps";
import todoCommentsRouter from "./routes/todoComments";
import todosRouter from "./routes/todos";
import tripsRouter from "./routes/trips";
import usersRouter from "./routes/users";

/**
 * Main Hono application with type annotations
 */
const app = new Hono<{ Bindings: Env }>();

/**
 * Health check endpoint
 */
app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

/**
 * Mount Better Auth routes
 * All auth routes are available at /api/auth/*
 */
app.use("/api/auth/*", async (c) => {
  // Create auth instance with current env
  const auth = createAuth(c.env);
  // Mount auth routes
  return auth.handler(c.req.raw);
});

/**
 * Mount API route groups.
 *
 * Routes are chained so that `typeof routes` captures the full endpoint
 * shape, which is what the Hono RPC client (`hc<AppType>`) relies on for
 * end-to-end type inference.
 */
const routes = app
  .route("/api/trips", tripsRouter)
  .route("/api/users", usersRouter)
  .route("/api/scraps", scrapsRouter)
  .route("/api/trips/:tripId/schedule", scheduleRouter)
  .route("/api/trips/:tripId/todos/:todoId/comments", todoCommentsRouter)
  .route("/api/trips/:tripId/todos", todosRouter)
  .route("/api/trips/:tripId/memo", memoRouter)
  .route("/api/trips/:tripId/members", membersRouter)
  .route("/api/trips", coverRouter);

/**
 * 404 handler — serve SPA index.html for client-side routes, JSON 404 for unknown API routes
 */
app.notFound(async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Not Found" }, 404);
  }
  if (c.env.ASSETS) {
    const assetResponse = await c.env.ASSETS.fetch(c.req.url);
    if (assetResponse.ok) return assetResponse as unknown as Response;
    const indexUrl = new URL("/index.html", c.req.url).toString();
    return (await c.env.ASSETS.fetch(indexUrl)) as unknown as Response;
  }
  return c.json({ error: "Not Found" }, 404);
});

/**
 * Error handler
 */
app.onError((_err, c) => {
  return c.json({ error: "Internal Server Error" }, 500);
});

/**
 * Export the app for Cloudflare Pages/Workers
 */
export default app;

/**
 * Export Hono app type for RPC client typing
 * Allows type-safe API calls from the client
 */
export type AppType = typeof routes;
