/**
 * vite.config.ts
 *
 * Vite configuration for the client SPA build and dev server.
 * Uses the React plugin and resolves the "@/" alias to "src/".
 * Supports mock mode via VITE_MOCK environment variable.
 */

import process from "node:process";
import { URL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isMock = env.VITE_MOCK === "true";

  console.log("[vite.config.js] mode:", mode);
  console.log("[vite.config.js] VITE_MOCK env var:", env.VITE_MOCK);
  console.log("[vite.config.js] isMock:", isMock);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        ...(isMock && {
          "@/api/users": fileURLToPath(new URL("./src/mocks/api/users.ts", import.meta.url)),
          "@/api/trips": fileURLToPath(new URL("./src/mocks/api/trips.ts", import.meta.url)),
          "@/api/schedule": fileURLToPath(new URL("./src/mocks/api/schedule.ts", import.meta.url)),
          "@/api/todos": fileURLToPath(new URL("./src/mocks/api/todos.ts", import.meta.url)),
          "@/api/memo": fileURLToPath(new URL("./src/mocks/api/memo.ts", import.meta.url)),
          "@/api/members": fileURLToPath(new URL("./src/mocks/api/members.ts", import.meta.url)),
          "@/lib/auth-client": fileURLToPath(new URL("./src/mocks/auth-client.ts", import.meta.url)),
        }),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
