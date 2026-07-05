/**
 * vite.config.ts
 *
 * Vite configuration for the client SPA build and dev server.
 * Uses the React plugin and resolves the "@/" alias to "src/".
 * Supports mock mode via VITE_MOCK environment variable.
 */

import process from "node:process";
import { URL, fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isMock = env.VITE_MOCK !== "false";

  console.log("[vite.config.js] mode:", mode);
  console.log("[vite.config.js] VITE_MOCK env var:", env.VITE_MOCK);
  console.log("[vite.config.js] isMock:", isMock);

  return {
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: [
        ...(isMock
          ? [
              {
                find: "@/api/users",
                replacement: fileURLToPath(new URL("./src/mocks/api/users.ts", import.meta.url)),
              },
              {
                find: "@/api/trips",
                replacement: fileURLToPath(new URL("./src/mocks/api/trips.ts", import.meta.url)),
              },
              {
                find: "@/api/schedule",
                replacement: fileURLToPath(new URL("./src/mocks/api/schedule.ts", import.meta.url)),
              },
              {
                find: "@/api/todos",
                replacement: fileURLToPath(new URL("./src/mocks/api/todos.ts", import.meta.url)),
              },
              {
                find: "@/api/memo",
                replacement: fileURLToPath(new URL("./src/mocks/api/memo.ts", import.meta.url)),
              },
              {
                find: "@/api/members",
                replacement: fileURLToPath(new URL("./src/mocks/api/members.ts", import.meta.url)),
              },
              {
                find: "@/lib/auth-client",
                replacement: fileURLToPath(new URL("./src/mocks/auth-client.ts", import.meta.url)),
              },
            ]
          : []),
        { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
      ],
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
