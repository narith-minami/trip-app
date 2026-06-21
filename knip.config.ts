// knip.config.ts
import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/main.tsx", "src/App.tsx"],
  project: ["src/**/*.{ts,tsx}"],
  ignore: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/*.stories.{ts,tsx}", "**/*.d.ts"],
  ignoreDependencies: ["@vitejs/plugin-react"],
};

export default config;

// -----------------------------------------------
// .husky/pre-commit (husky v9)
// -----------------------------------------------
// #!/usr/bin/env sh
// pnpm lint-staged
//
// -----------------------------------------------
// .husky/pre-push
// -----------------------------------------------
// #!/usr/bin/env sh
// pnpm typecheck
