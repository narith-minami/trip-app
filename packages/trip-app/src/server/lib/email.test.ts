import { afterEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../env";
import { renderPasswordResetEmail, sendEmail, sendPasswordResetEmail } from "./email";

const env = {
  DB: {} as Env["DB"],
  AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:5173",
  RESEND_API_KEY: "re_test_key",
  EMAIL_FROM: "Trip App <noreply@example.com>",
} satisfies Env;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendEmail", () => {
  it("posts to the Resend API with the API key, from address, and payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await sendEmail(env, {
      to: "user@example.com",
      subject: "件名",
      html: "<p>本文</p>",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers.get("Authorization")).toBe("Bearer re_test_key");
    expect(JSON.parse(options.body)).toMatchObject({
      from: env.EMAIL_FROM,
      to: "user@example.com",
      subject: "件名",
      html: "<p>本文</p>",
    });
  });

  it("throws when Resend returns an error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ name: "validation_error", message: "invalid `to` field" }), {
          status: 422,
          headers: { "content-type": "application/json" },
        })
      )
    );

    await expect(
      sendEmail(env, { to: "not-an-email", subject: "件名", html: "<p>本文</p>" })
    ).rejects.toThrow("invalid `to` field");
  });
});

describe("renderPasswordResetEmail", () => {
  it("embeds the reset URL as both a link href and plain text", () => {
    const html = renderPasswordResetEmail("https://trip-app.example.com/reset-password?token=abc");
    expect(html).toContain('href="https://trip-app.example.com/reset-password?token=abc"');
    expect(html).toContain("https://trip-app.example.com/reset-password?token=abc");
  });
});

describe("sendPasswordResetEmail", () => {
  it("sends a Japanese subject line with the reset URL in the body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await sendPasswordResetEmail(env, {
      to: "user@example.com",
      resetUrl: "https://trip-app.example.com/reset-password?token=abc",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.subject).toBe("パスワード再設定のご案内");
    expect(body.to).toBe("user@example.com");
    expect(body.html).toContain("https://trip-app.example.com/reset-password?token=abc");
  });
});
