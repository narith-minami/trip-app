/**
 * src/api/client.ts
 *
 * Hono RPC client for type-safe API calls.
 * Provides automatic type inference from server routes.
 */

import { hc } from "hono/client";
import type { AppType } from "@/server/app";

export const apiClient = hc<AppType>("/");
