/**
 * src/api/users.ts
 *
 * Users API query functions.
 */

import { apiClient } from "./client";

/**
 * Fetch current user info
 */
export async function fetchCurrentUser() {
  const res = await apiClient.api.users.me.$get();
  if (!res.ok) {
    throw new Error("Failed to fetch current user");
  }
  return res.json();
}
