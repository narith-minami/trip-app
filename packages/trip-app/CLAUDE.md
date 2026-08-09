# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **full-stack trip planning application** built with TanStack Start, a React-based full-stack framework. The architecture separates cleanly into backend and frontend code.

### Core Technologies

- **Framework**: TanStack Start (full-stack React framework with Vite)
- **Server**: Hono (lightweight web framework for API routes)
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Authentication**: Better Auth
- **Frontend**: React 19 + TanStack Router + TanStack Query
- **Validation**: Zod
- **Deployment**: Cloudflare Pages/Workers
- **Testing**: Vitest + React Testing Library + Playwright

### Project Structure

```
src/
├── server/              # Backend code (Hono API)
│   ├── app.ts          # Main Hono application
│   ├── env.ts          # Environment types
│   ├── db/             # Database layer (Drizzle ORM)
│   │   ├── index.ts    # Database factory and schema exports
│   │   ├── schema.ts   # Drizzle schema definitions
│   │   └── auth-schema.ts
│   ├── routes/         # API route handlers
│   │   ├── auth.ts     # Better Auth integration
│   │   ├── trips.ts
│   │   ├── schedule.ts
│   │   ├── todos.ts
│   │   ├── memo.ts
│   │   ├── members.ts
│   │   ├── users.ts
│   │   └── cover.ts
│   └── middleware/     # Auth and authorization middleware
│
├── routes/             # Frontend TanStack Router pages
│   ├── __root.tsx      # Root layout with QueryClientProvider
│   ├── index.tsx       # Home/trips list
│   └── trips/
│       ├── index.tsx   # Trips list page
│       └── $tripId/
│           └── index.tsx # Trip detail page (schedule, todos, memo, members)
│
├── api/                # API client layer (Hono RPC)
│   ├── client.ts       # Type-safe Hono RPC client instance
│   ├── trips.ts
│   ├── schedule.ts
│   ├── todos.ts
│   ├── memo.ts
│   ├── members.ts
│   └── users.ts
│
├── features/           # Feature-specific modules (domain-driven)
│   ├── schedule/       # Schedule management
│   │   ├── components/ # ScheduleItemCard, ScheduleItemForm, ScheduleSection, ScheduleTimeline
│   │   └── hooks/      # useScheduleItems, useScheduleMutations
│   ├── todos/          # Todo management
│   │   ├── components/ # TodoForm, TodoItem, TodoList, TodosSection
│   │   └── hooks/      # useTodos, useTodoMutations
│   ├── memo/           # Trip memo/notes (sticky notes, multiple per trip)
│   │   ├── components/ # MemoSection, MemoComposer, MemoCard, MemoForm, MemoList
│   │   └── hooks/      # useMemos, useMemoMutations
│   ├── members/        # Trip members/guests
│   │   ├── components/ # InviteLinkBox, MemberAvatarList, MembersSection
│   │   └── hooks/      # useMembers
│   └── trips/          # Trip management (data layer)
│
├── components/         # Reusable UI components
│   ├── ui/             # Primitive components (button, card, input, dialog, tabs, avatar)
│   ├── layout/         # Layout components (AppShell, PageContainer)
│   └── feedback/       # Feedback components (ErrorBoundary, LoadingSpinner, EmptyState)
│
├── lib/                # Utilities and shared logic
│   ├── auth-client.ts  # Browser-side Better Auth client
│   ├── queryClient.ts  # TanStack Query configuration
│   ├── queryKeys.ts    # Query key factory
│   ├── cn.ts           # classnames utility
│   ├── schemas/        # Zod validation schemas
│   └── utils.test.ts, cn.test.ts # Unit tests
│
├── main.tsx            # Client entry point (React root)
├── routeTree.tsx       # Hand-authored TanStack Router tree
├── types/              # Shared TypeScript types (entities.ts)
├── styles/globals.css  # Global CSS (Tailwind)
└── hooks/              # Custom React hooks
```

### Key Architectural Patterns

1. **Type-Safe API Calls**: Uses Hono's RPC client (`hc<AppType>`) to automatically infer types from server routes. Client calls to `/api/*` are fully type-safe.

2. **Server-Client Boundary**: 
   - Server code in `src/server/` (Hono)
   - Routes are defined in Hono handlers with Zod validation
   - Client calls them via the RPC client in `src/api/`
   - Backend validation: `@hono/zod-validator` middleware

3. **Database**: Cloudflare D1 with Drizzle ORM
   - Schema defined in `src/server/db/schema.ts`
   - Migrations in `migrations/` directory
   - Database is initialized via `getDb(env)` factory function
   - Better Auth manages auth-specific tables; we control app tables

4. **Authentication**: Better Auth with Cloudflare D1
   - Auth routes mounted at `/api/auth/*`
   - Session management and user management built-in
   - `src/server/routes/auth.ts` creates the auth instance
   - Client hook: `useSession()` from `src/lib/auth-client.ts`

5. **State Management**: TanStack Query for server state
   - Query keys defined in `src/lib/queryKeys.ts`
   - Query client configured in `src/lib/queryClient.ts`
   - Automatic synchronization with server state
   - Mutations handle create/update/delete operations

6. **Feature-Based Organization**: Each feature (schedule, todos, memo, members) has:
   - Components folder: UI components for that feature
   - Hooks folder: `useQuery` hooks, `useMutation` hooks, custom logic
   - Separation of concerns: presentation, data fetching, business logic

7. **UI Component System**: Lightweight custom components (not shadcn)
   - Primitive components in `src/components/ui/` (button, card, input, etc.)
   - Variant-based styling using classnames utility
   - Built on HTML primitives with Tailwind CSS
   - Components use `forwardRef` for direct DOM access when needed

## Development Commands

### Core Commands

- **`pnpm dev`** — Start development server (Vite + TanStack Start). Opens at `http://localhost:5173`
- **`pnpm build`** — Build for production (TypeScript + Vite)
- **`pnpm preview`** — Preview production build locally
- **`pnpm typecheck`** — Run TypeScript without emitting (fast type validation)

### Testing

- **`pnpm test`** — Run all unit tests once
- **`pnpm test:watch`** — Watch mode for continuous testing
- **`pnpm test:coverage`** — Generate coverage report (target: 70% coverage)
- **`pnpm test:e2e`** — Run Playwright end-to-end tests

### Linting & Formatting

- **`pnpm lint`** — Run all linters (Biome, ESLint, dependency-cruiser, react-doctor)
- **`pnpm lint:fix`** — Auto-fix linting issues
- **`pnpm lint:biome`** — Biome linter only
- **`pnpm lint:eslint`** — ESLint only (React-specific rules)
- **`pnpm lint:deps`** — Check dependency boundaries (dependency-cruiser)
- **`pnpm lint:doctor`** — React-specific diagnostics
- **`pnpm format:check`** — Check formatting without fixing
- **`pnpm format`** — Auto-format all code (Biome)

### Quality Gates

- **`pnpm check`** — Full check: typecheck → format → lint → test (before pushing)
- **`pnpm check:full`** — Full check + `knip` (find unused exports)
- **`pnpm knip`** — Find unused files and exports (code cleanup tool)

### Dependency Management

- **`pnpm deps:audit`** — Check for CVEs (moderate and above)
- **`pnpm deps:update`** — Interactive dependency updater
- **`pnpm deps:graph`** — Generate dependency graph as SVG
- **`pnpm deps:metrics`** — Analyze dependency metrics

## Application Entry Points

### Client Entry Point
- **`src/main.tsx`**: React root that creates the TanStack Router instance from `src/routeTree.tsx` and mounts the app
- **`src/routeTree.tsx`**: Hand-authored route tree (not file-based). Maps route paths to page components
- **Routes under `src/routes/`**: Page components for each route (index, trips list, trip detail)

### Server Entry Point
- **`src/server/app.ts`**: Hono application that mounts all API routes
- Configured in `app.config.ts` to deploy as Cloudflare Pages API

### Styling
- Uses **Tailwind CSS** with global styles in `src/styles/globals.css`
- UI components use inline Tailwind classes for styling
- Utility function `cn()` in `src/lib/cn.ts` for conditional classname merging
- CSS file built by Vite and included globally

## Development Workflow

### Before Committing

1. Run `pnpm check` to ensure all checks pass
2. If needed, run `pnpm lint:fix` and `pnpm format`
3. **セルフレビュー**: `AGENTS.md` のレビュー観点チェックリストを上から順に確認する
4. Commit changes

### Adding a New Feature

1. **Create feature folder** in `src/features/<feature>/` with `components/` and `hooks/` subfolders
2. **Create components** for UI (e.g., `FeatureSection.tsx`, `FeatureForm.tsx`)
3. **Create hooks** for data fetching and mutations (e.g., `useFeature.ts`, `useFeatureMutations.ts`)
4. **Add server routes** in `src/server/routes/<feature>.ts` with Zod validation
5. **Mount API route** in `src/server/app.ts`
6. **Create client** in `src/api/<feature>.ts` to wrap RPC calls
7. **Update query keys** in `src/lib/queryKeys.ts` if using TanStack Query

### Adding a New API Route

1. **Create server handler** in `src/server/routes/<feature>.ts` (or extend existing)
2. **Add Zod schemas** for request/response validation at the top of the file
3. **Use `@hono/zod-validator`** middleware to validate requests
4. **Mount route** in `src/server/app.ts` (e.g., `app.route("/api/feature", featureRouter)`)
5. **Create client wrapper** in `src/api/<feature>.ts` using the Hono RPC client
6. **Create hooks** in `src/features/<feature>/hooks/` that use the client

### Adding a New Database Table

1. **Define schema** in `src/server/db/schema.ts` (Drizzle)
2. **Run migration**: `pnpm drizzle-kit generate:sqlite` (generates migration file)
3. **Apply migration** to D1 via Cloudflare dashboard or CLI
4. **Export types** from `src/server/db/index.ts`
5. **Add query keys** in `src/lib/queryKeys.ts` if using TanStack Query

### Writing Tests

- Place unit tests alongside source files: `src/lib/utils.test.ts`
- Place component tests with components: `src/components/Button.test.tsx`
- Use Vitest + React Testing Library for unit/component tests
- Target 70% coverage (configured in `vitest.config.ts`)
- E2E tests in `src/**/*.e2e.ts` (run with `pnpm test:e2e` via Playwright)
- Coverage excludes: `src/types/`, `src/lib/` (library wrappers), `src/main.tsx`, story files

## Configuration Files

- **`app.config.ts`** — TanStack Start configuration (Cloudflare Pages preset, routers)
- **`vite.config.ts`** — Vite client build config (React plugin, "@/" alias, sourcemaps)
- **`tsconfig.json`** — Strict TypeScript settings (noImplicitReturns, exactOptionalPropertyTypes, etc.)
- **`vitest.config.ts`** — Vitest settings, coverage thresholds (70%), jsdom environment
- **`biome.json`** — Biome linter/formatter config
- **`eslint.config.mjs`** — ESLint config (React, React Compiler, Sonar rules)
- **`drizzle.config.ts`** — Drizzle ORM migration config (D1, tablesFilter)
- **`index.html`** — HTML entry point with `<div id="root">`
- **`.dependency-cruiser.cjs`** — Dependency boundary rules
- **`knip.config.ts`** — Unused code detection
- **`wrangler.toml`** — Cloudflare Pages configuration

## Important Patterns

### Type-Safe Environment Variables

- Define types in `src/server/env.ts`
- Access via `c.env` in route handlers
- Available in `drizzle.config.ts` via `process.env`

### Query Keys & Caching

- Define all query keys in `src/lib/queryKeys.ts` (for maintainability)
- Use with `useQuery` and `useMutation` throughout the app
- Invalidate on mutations for automatic revalidation

### Middleware & Guards

- `src/server/middleware/auth.ts` — Authentication middleware
- `src/server/middleware/requireMember.ts` — Trip membership guard
- Apply in route handlers as needed

### Better Auth Integration

- Auth created in `src/server/routes/auth.ts`
- Session data available via `useSession()` hook (client)
- Middleware checks sessions in route handlers (server)

## Deployment

This project deploys to **Cloudflare Pages** with a **Cloudflare D1** database backend.

- Configured in `app.config.ts` with `preset: "cloudflare-pages"`
- Environment bindings for database configured in `wrangler.toml`
- Build command runs `pnpm build`

## Code Quality Standards

- **TypeScript Strict Mode**: Enabled for all source files
- **Linting**: Biome (formatting/logical) + ESLint (React-specific) + dependency-cruiser (boundaries)
- **Test Coverage**: Target 70% (can be increased over time)
- **Formatting**: Biome handles all formatting (no Prettier)
- **Pre-commit Hooks**: Husky + lint-staged (format & lint on commit)
- **セルフレビュー**: PRを作る前に `AGENTS.md` のレビュー観点チェックリストで確認する（過去PRの指摘パターンを網羅）

## Important Notes

### Routing
- Uses **hand-authored route tree** in `src/routeTree.tsx`, not file-based routing
- Route IDs must match `from` values used in `useParams()` calls
- Parent route at `/trips/$tripId` doesn't have a component; child route renders via `<Outlet />`

### UI Component Development
- Components are lightweight custom implementations (not from a pre-built library)
- Use `cn()` utility for conditional classnames
- Button, Card, Input, Dialog, Tabs, Avatar all have variant/size props
- Tailwind CSS classes used inline; global styles in `src/styles/globals.css`

### Server Validation
- All input validation done on server via **Zod schemas** and `@hono/zod-validator` middleware
- Schemas defined in route files (not separate schema files yet)
- Type inference from schemas provides end-to-end type safety

### Feature Structure Best Practice
For each major feature (schedule, todos, memo, members):
```
src/features/<feature>/
├── components/         # Ui-specific components
│   ├── <Feature>Section.tsx     # Container/view component
│   ├── <Feature>Form.tsx        # Form input component
│   └── <Feature>Card.tsx        # Item display component
└── hooks/              # Data layer
    ├── use<Feature>.ts          # useQuery hook
    └── use<Feature>Mutations.ts # useMutation hooks (create, update, delete)
```
