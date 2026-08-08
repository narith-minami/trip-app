/**
 * src/routes/reset-password.tsx
 *
 * Reset password page, reached from the link sent by the forgot-password
 * flow. Reads the reset token from the `?token=` query param.
 */

import { useNavigate, useSearch } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";

function InvalidResetLink() {
  const navigate = useNavigate();
  return (
    <AuthCard icon={KeyRound} title="パスワード再設定">
      <div className="text-center">
        <p className="text-red-600">このリンクは無効です</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/forgot-password" })}>
          もう一度リクエストする
        </Button>
      </div>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const { token } = useSearch({ from: "/reset-password" });

  if (!token) return <InvalidResetLink />;

  return (
    <AuthCard icon={KeyRound} title="新しいパスワードを設定">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
