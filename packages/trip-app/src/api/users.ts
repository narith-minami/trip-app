/**
 * src/api/users.ts
 *
 * Users API query functions.
 */

import { apiClient } from "./client";
import { unwrap } from "./unwrap";

/**
 * Fetch current user info
 */
export async function fetchCurrentUser() {
  return unwrap(await apiClient.api.users.me.$get(), "Failed to fetch current user");
}
