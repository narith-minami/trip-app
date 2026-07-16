import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { accounts, sessions, users, verifications } from "../db/auth-schema";
import type { Env } from "../env";
import { authDrizzleSchema, createAuth } from "./auth";

describe("authDrizzleSchema", () => {
  it("maps the 4 Better Auth models to the expected Drizzle tables", () => {
    expect(authDrizzleSchema.user).toBe(users);
    expect(authDrizzleSchema.session).toBe(sessions);
    expect(authDrizzleSchema.account).toBe(accounts);
    expect(authDrizzleSchema.verification).toBe(verifications);
  });

  it("maps each model to its physical table name", () => {
    expect(getTableName(authDrizzleSchema.user)).toBe("users");
    expect(getTableName(authDrizzleSchema.session)).toBe("sessions");
    expect(getTableName(authDrizzleSchema.account)).toBe("accounts");
    expect(getTableName(authDrizzleSchema.verification)).toBe("verifications");
  });
});

describe("createAuth", () => {
  it("constructs a Better Auth instance from env bindings without throwing", () => {
    const env = {
      DB: {} as Env["DB"],
      AUTH_SECRET: "test-secret",
      BETTER_AUTH_URL: "http://localhost:5173",
    } satisfies Env;

    const auth = createAuth(env);

    expect(typeof auth.api.getSession).toBe("function");
  });

  it("only enables the Google provider when both OAuth credentials are set", () => {
    const baseEnv = {
      DB: {} as Env["DB"],
      AUTH_SECRET: "test-secret",
      BETTER_AUTH_URL: "http://localhost:5173",
    } satisfies Env;

    const withoutGoogle = createAuth(baseEnv);
    expect(withoutGoogle.options.socialProviders?.google).toBeUndefined();

    const withGoogle = createAuth({
      ...baseEnv,
      GOOGLE_CLIENT_ID: "client-id",
      GOOGLE_CLIENT_SECRET: "client-secret",
    });
    expect(withGoogle.options.socialProviders?.google).toBeDefined();
  });
});
