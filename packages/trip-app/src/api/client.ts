/**
 * src/api/client.ts
 *
 * Hono RPC client for type-safe API calls.
 * Provides automatic type inference from server routes.
 */

import type { AppType } from "@/server/app";
import { hc } from "hono/client";

export const apiClient = hc<AppType>("/");
