/**
 * src/server/lib/errors.ts
 *
 * Shared user-facing error messages for API responses.
 * All routes return Japanese messages from this single source so the
 * wording stays consistent (previously each route re-declared its own).
 */

export const ERROR_MESSAGES = {
  INTERNAL: "内部サーバーエラー",
  UNAUTHORIZED: "認証が必要です",
  FORBIDDEN: "アクセスが拒否されました",
  NOT_FOUND: "リソースが見つかりません",
  TRIP_NOT_FOUND: "旅行が見つかりません",
} as const;
