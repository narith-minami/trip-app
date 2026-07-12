import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
  // Better Auth manages its own tables (users, sessions, accounts, verifications).
  // Only migrate our app tables.
  tablesFilter: [
    "trips",
    "trip_members",
    "schedule_items",
    "todos",
    "trip_memos",
    "scraps",
    "scrap_tags",
  ],
});
