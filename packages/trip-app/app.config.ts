import { defineConfig } from "@tanstack/start/config";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "cloudflare-pages",
  },
  routers: {
    api: {
      entry: "./src/server/app.ts",
    },
  },
  vite: {
    plugins: [viteTsconfigPaths()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
