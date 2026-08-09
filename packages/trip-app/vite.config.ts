/**
 * vite.config.ts
 *
 * Vite configuration for the client SPA build and dev server.
 * Uses the React plugin and resolves the "@/" alias to "src/".
 * Supports mock mode via VITE_MOCK environment variable.
 */

import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Cloudflare Workers Builds runs the exact same "Build command" for every
  // branch (its dashboard settings only let build/deploy commands differ
  // production-vs-preview at the *deploy* step, not build) — so the
  // build:production npm script (VITE_MOCK=false) never actually runs in
  // CI; the dashboard always invokes plain `pnpm run build`. Without this
  // fallback, merging to main silently keeps shipping mock mode. When
  // VITE_MOCK isn't set explicitly, infer it from the CI-injected branch
  // name instead: real mode on the production branch, mock everywhere else.
  const isWorkersCi = env.WORKERS_CI === "1";
  const isProductionBranch = env.WORKERS_CI_BRANCH === "main";
  const isMock =
    env.VITE_MOCK !== undefined
      ? env.VITE_MOCK !== "false"
      : isWorkersCi
        ? !isProductionBranch
        : true;

  console.log("[vite.config.js] mode:", mode);
  console.log("[vite.config.js] VITE_MOCK env var:", env.VITE_MOCK);
  console.log(
    "[vite.config.js] WORKERS_CI:",
    env.WORKERS_CI,
    "WORKERS_CI_BRANCH:",
    env.WORKERS_CI_BRANCH
  );
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
                find: "@/api/facilities",
                replacement: fileURLToPath(
                  new URL("./src/mocks/api/facilities.ts", import.meta.url)
                ),
              },
              {
                find: "@/api/todos",
                replacement: fileURLToPath(new URL("./src/mocks/api/todos.ts", import.meta.url)),
              },
              {
                find: "@/api/todoComments",
                replacement: fileURLToPath(
                  new URL("./src/mocks/api/todoComments.ts", import.meta.url)
                ),
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
                find: "@/api/scraps",
                replacement: fileURLToPath(new URL("./src/mocks/api/scraps.ts", import.meta.url)),
              },
              {
                find: "@/api/invite",
                replacement: fileURLToPath(new URL("./src/mocks/api/invite.ts", import.meta.url)),
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
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8787",
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
