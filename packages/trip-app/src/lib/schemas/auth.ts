/**
 * src/lib/schemas/auth.ts
 *
 * Shared password validation for the signup and reset-password forms.
 * Client-only (Better Auth handles the actual reset/signup calls server-side,
 * so there's no isomorphic Zod schema to share with a route handler here).
 */

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Validates a password + confirmation pair. Returns the first user-facing
 * error message, or null if valid. Mismatch is checked before length so a
 * password that's both short and mismatched reports the mismatch first.
 */
export function validateNewPassword(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) return "パスワードが一致しません";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `パスワードは${PASSWORD_MIN_LENGTH}文字以上にしてください`;
  }
  return null;
}
