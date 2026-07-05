# CLAUDE.md

This repository is a **pnpm monorepo**. This root file only covers monorepo-wide
conventions; each package has its own `CLAUDE.md` with package-specific details.

## Packages

- **`packages/trip-app/`** — The trip planning application (TanStack Start, Hono,
  Cloudflare D1). See `packages/trip-app/CLAUDE.md` for architecture, dev commands,
  and coding conventions. Review checklist: `packages/trip-app/AGENTS.md`.
- **`packages/kimi-agent/`** — Issue-driven coding agent infrastructure running on
  Cloudflare Workers/Containers (OpenHands + Kimi K2.7 Code). See
  `packages/kimi-agent/docs/README.md`.

## Running commands

Root-level scripts (`pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`,
`pnpm test`, `pnpm check`, etc.) delegate to the `trip-app` package via
`pnpm --filter trip-app <script>`. To target a specific package directly, use
`pnpm --filter <package-name> <script>` (package names: `trip-app`,
`@monorepo/kimi-agent`), or `cd` into `packages/<name>` first — this is required
for tools invoked directly via `npx` (e.g. `wrangler`, `drizzle-kit`), since those
bypass pnpm's workspace filtering.

## Workspace config

- `pnpm-workspace.yaml` defines the `packages/*` glob plus supply-chain hardening
  settings (`minimumReleaseAge`, `trustPolicy`) that apply repo-wide.
- `packageManager`, `engines`, and the `pnpm.onlyBuiltDependencies` allowlist live
  in the root `package.json` (pnpm only honors these at the workspace root).
