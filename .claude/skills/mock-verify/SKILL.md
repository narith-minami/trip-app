---
name: mock-verify
description: Use when enabling, fixing, or verifying mock mode (VITE_MOCK=true). Covers the Vite alias ordering bug, how to confirm mocks are loaded, and how to drive the app with Playwright headless to verify each feature.
version: "1.0.0"
---

# Mock Verify

Enables and verifies the app's mock mode (`VITE_MOCK=true`), where all API and auth calls are replaced by in-memory stubs in `src/mocks/`.

## Trigger

Use when the user says: "モックモードで検証", "mock mode で動作確認", "VITE_MOCK を有効にして確認", or anything about running the app without a real backend.

---

## Step 1 — Check `.env`

```bash
cat .env | grep VITE_MOCK
```

Expected: `VITE_MOCK=true`. If missing, add it.

---

## Step 2 — Fix the Vite alias ordering bug (known issue)

The mock aliases in `vite.config.ts` **must use array format** with specific aliases first. If they use the object shorthand, the general `"@"` alias matches before `"@/api/trips"` and mocks are silently skipped.

**Wrong (object — `"@"` wins, mocks never used):**
```ts
alias: {
  "@": "src/",
  "@/api/trips": "src/mocks/api/trips.ts",  // dead
}
```

**Correct (array — specific aliases first):**
```ts
alias: [
  { find: "@/api/trips",      replacement: "src/mocks/api/trips.ts" },
  { find: "@/api/users",      replacement: "src/mocks/api/users.ts" },
  { find: "@/api/schedule",   replacement: "src/mocks/api/schedule.ts" },
  { find: "@/api/todos",      replacement: "src/mocks/api/todos.ts" },
  { find: "@/api/memo",       replacement: "src/mocks/api/memo.ts" },
  { find: "@/api/members",    replacement: "src/mocks/api/members.ts" },
  { find: "@/lib/auth-client", replacement: "src/mocks/auth-client.ts" },
  { find: "@", replacement: "src/" },   // fallback last
],
```

Check `vite.config.ts` for the current shape and fix if needed.

---

## Step 3 — Start dev server and confirm mocks load

```bash
pnpm dev &
sleep 5
```

The startup log should show:
```
[vite.config.js] VITE_MOCK env var: true
[vite.config.js] isMock: true
```

To confirm mock files are actually served (not the real API), check network requests in the browser or with Playwright — they should hit `src/mocks/api/*.ts`, not `/api/*`.

---

## Step 4 — Verify with Playwright

Install browsers if needed:
```bash
pnpm playwright install chromium
```

Run a headless verification script. Key checks:

| Check | How |
|-------|-----|
| Mock auth redirects `/` → `/trips` | `page.waitForURL('**/trips**')` |
| Trips list shows seed data | `page.locator('button').filter({ hasText: '東京旅行' })` |
| Trip detail loads all 4 tabs | Click Schedule / Todos / Memo / Members and assert text |
| CRUD: add todo | Fill `input[placeholder="Add a todo..."]`, click Add |
| CRUD: add schedule item | Click `+ Add item`, fill `input[placeholder="e.g., Check-in at hotel"]`, click Save |
| CRUD: create trip | Click `+ New Trip`, fill form, submit |
| Zero console errors | `page.on('pageerror', ...)` accumulator must be empty |

Use `node_modules/@playwright/test/index.mjs` as the import path (not bare `playwright`).

---

## Step 5 — Stop server

```bash
pkill -f "vite"
```

---

## Mock file map

| Real import | Mock replacement | Notes |
|-------------|-----------------|-------|
| `@/api/trips` | `src/mocks/api/trips.ts` | In-memory CRUD, seed = 東京旅行 |
| `@/api/users` | `src/mocks/api/users.ts` | Always returns Dev User |
| `@/api/schedule` | `src/mocks/api/schedule.ts` | 2 seed items for trip-1 |
| `@/api/todos` | `src/mocks/api/todos.ts` | 3 seed todos for trip-1 |
| `@/api/memo` | `src/mocks/api/memo.ts` | Single mutable memo per tripId |
| `@/api/members` | `src/mocks/api/members.ts` | 1 owner member for trip-1 |
| `@/lib/auth-client` | `src/mocks/auth-client.ts` | `useSession()` always returns authenticated Dev User |
