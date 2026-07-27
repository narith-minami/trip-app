/**
 * src/api/client.ts
 *
 * Hono RPC client for type-safe API calls.
 * Provides automatic type inference from server routes.
 *
 * Intercepts 401 responses and redirects to the login page so that
 * unauthenticated users are returned to login from any protected page.
 */

import { hc } from "hono/client";
import type { AppType } from "@/server/app";

const redirectToLoginPaths = ["/login", "/signup"];

/**
 * Custom fetch wrapper that redirects to the login page on 401.
 *
 * This makes every API call behave consistently: if the session is missing or
 * expired, the user is sent back to `/login` regardless of which page triggered
 * the request.
 */
const authAwareFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    !redirectToLoginPaths.includes(window.location.pathname)
  ) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};

export const apiClient = hc<AppType>("/", { fetch: authAwareFetch });
