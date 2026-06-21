/**
 * src/lib/auth-client.ts
 *
 * Browser-side Better Auth client for React components.
 * Handles authentication state and provides hooks for login/logout/session.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client instance for browser
 * Points to /api/auth endpoints on the same origin
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth`
      : "http://localhost:5174/api/auth",
});

/**
 * Re-export commonly used auth functions and hooks
 */
export const { useSession, signIn, signOut, signUp } = authClient;

/**
 * Get current session (promise-based)
 */
export async function getSession() {
  return authClient.getSession();
}
