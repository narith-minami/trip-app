/**
 * vitest.config.ts
 *
 * Vitest configuration for unit tests.
 * Runs in the Node environment with v8 coverage and resolves the "@/" alias.
 */

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
  },
});
