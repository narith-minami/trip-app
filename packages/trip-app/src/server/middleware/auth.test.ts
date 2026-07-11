import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";
import { createAuth } from "../routes/auth";
import type { AuthContext } from "./auth";
import { requireSession } from "./auth";

vi.mock("../routes/auth");

function mockAuth(getSessionValue: unknown) {
  vi.mocked(createAuth).mockReturnValue({
    api: {
      getSession: vi.fn().mockResolvedValue(getSessionValue),
    },
  } as unknown as ReturnType<typeof createAuth>);
}

describe("requireSession", () => {
  it("returns 401 when there is no active session", async () => {
    mockAuth({ session: null, user: null });

    const app = new Hono<AuthContext>().get("/test", requireSession(), (c) =>
      c.json({ userId: c.get("user")?.id })
    );

    const res = await app.request("/test");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when getSession rejects", async () => {
    vi.mocked(createAuth).mockReturnValue({
      api: {
        getSession: vi.fn().mockRejectedValue(new Error("token expired")),
      },
    } as unknown as ReturnType<typeof createAuth>);

    const app = new Hono<AuthContext>().get("/test", requireSession(), (c) =>
      c.json({ userId: c.get("user")?.id })
    );

    const res = await app.request("/test");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("sets session and user variables for downstream handlers", async () => {
    const session = {
      id: "sess_test",
      userId: "user_test",
      token: "token_test",
      expiresAt: 1893456000,
      createdAt: 1704067200,
      updatedAt: 1704067200,
    };
    const user = {
      id: "user_test",
      name: "Test User",
      email: "test@example.com",
      emailVerified: true,
      createdAt: 1704067200,
      updatedAt: 1704067200,
    };
    mockAuth({ session, user });

    const app = new Hono<AuthContext>().get("/test", requireSession(), (c) =>
      c.json({
        userId: c.get("user")?.id,
        sessionId: c.get("session")?.id,
      })
    );

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      userId: "user_test",
      sessionId: "sess_test",
    });
  });
});
