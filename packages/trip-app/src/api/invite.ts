/**
 * src/api/invite.ts
 *
 * Invite link API query functions.
 */

import { apiClient } from "./client";
import { unwrap } from "./unwrap";

/**
 * Fetch a public preview of the trip behind an invite token
 */
export async function fetchInvitePreview(token: string) {
  return unwrap(
    await apiClient.api.invite[":token"].$get({
      param: { token },
    }),
    "招待リンクが無効です"
  );
}

/**
 * Join the trip behind an invite token as the current user.
 *
 * A 409 (already a member) is treated as a non-fatal outcome: the caller
 * still gets the `tripId` back so it can navigate to the trip either way.
 */
export async function joinTripByInvite(token: string) {
  const res = await apiClient.api.invite[":token"].join.$post({
    param: { token },
  });
  const data = await res.json();
  if (!res.ok && res.status !== 409) {
    throw new Error("参加に失敗しました");
  }
  return data as { tripId: string; error?: string };
}
