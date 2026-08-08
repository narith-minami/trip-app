// knip.config.ts
import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/main.tsx", "app.config.ts"],
  project: ["src/**/*.{ts,tsx}"],
  ignore: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/*.stories.{ts,tsx}", "**/*.d.ts"],
  ignoreDependencies: ["@vitejs/plugin-react", "lint-staged", "tailwindcss"],
};

export default config;
