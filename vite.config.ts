/**
 * vite.config.ts
 *
 * Vite configuration for the client SPA build and dev server.
 * Uses the React plugin and resolves the "@/" alias to "src/".
 */

import { URL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
