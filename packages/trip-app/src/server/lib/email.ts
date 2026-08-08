/**
 * src/server/lib/email.ts
 *
 * Resend-backed transactional email sending.
 * Generic `sendEmail` wrapper plus per-purpose helpers (password reset today,
 * reusable for future transactional email such as address verification).
 */

import { Resend } from "resend";
import type { Env } from "../env";

export async function sendEmail(
  env: Env,
  params: { to: string; subject: string; html: string }
): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
}

export function renderPasswordResetEmail(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h1 style="font-size: 20px;">パスワードの再設定</h1>
      <p>Trip App のパスワード再設定リクエストを受け付けました。</p>
      <p>以下のボタンから、新しいパスワードを設定してください（このリンクは1時間有効です）。</p>
      <p style="margin: 24px 0;">
        <a
          href="${resetUrl}"
          style="background: #ff6b5f; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600;"
        >
          パスワードを再設定する
        </a>
      </p>
      <p style="font-size: 12px; color: #6b6b6b;">
        ボタンが機能しない場合は、以下の URL をブラウザに貼り付けてください。<br />
        ${resetUrl}
      </p>
      <p style="font-size: 12px; color: #6b6b6b;">
        このメールに心当たりがない場合は、このメールを無視してください。パスワードは変更されません。
      </p>
    </div>
  `.trim();
}

export async function sendPasswordResetEmail(
  env: Env,
  params: { to: string; resetUrl: string }
): Promise<void> {
  await sendEmail(env, {
    to: params.to,
    subject: "パスワード再設定のご案内",
    html: renderPasswordResetEmail(params.resetUrl),
  });
}
