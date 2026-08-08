/**
 * src/routes/forgot-password.tsx
 *
 * Forgot password page.
 * Lets a user request a password-reset email by entering their address.
 * Always shows the same success message regardless of whether the address
 * is registered, so the endpoint can't be used to enumerate accounts.
 */

import { useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth-client";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("メールアドレスを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email, redirectTo: "/reset-password" });
    } catch {
      // Ignored: the confirmation message below is shown regardless of
      // outcome so the endpoint can't be used to check which emails exist.
    }
    setIsSent(true);
    setIsSubmitting(false);
  };

  return (
    <AuthCard icon={Mail} title="パスワード再設定">
      {isSent ? (
        <p className="text-center text-sm text-ink-muted">
          入力されたメールアドレス宛に、パスワード再設定用のリンクを送信しました。
          メールが届かない場合は、アドレスの入力ミスや迷惑メールフォルダをご確認ください。
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-muted">
            登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" variant="primary">
              {isSubmitting ? "送信中..." : "再設定用リンクを送信"}
            </Button>
          </form>
        </>
      )}

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          className="text-sm font-medium text-coral hover:text-coral-light"
        >
          ログイン画面に戻る
        </button>
      </div>
    </AuthCard>
  );
}
