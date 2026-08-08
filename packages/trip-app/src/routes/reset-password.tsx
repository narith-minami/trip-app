/**
 * src/routes/reset-password.tsx
 *
 * Reset password page, reached from the link sent by the forgot-password
 * flow. Reads the reset token from the `?token=` query param.
 */

import { useNavigate, useSearch } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth-client";

interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

function validateResetPassword({ newPassword, confirmPassword }: ResetPasswordValues) {
  if (!newPassword || !confirmPassword) return "すべての項目を入力してください";
  if (newPassword !== confirmPassword) return "パスワードが一致しません";
  if (newPassword.length < 8) return "パスワードは8文字以上にしてください";
  return null;
}

interface ResetPasswordFormProps {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function ResetPasswordForm({
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  isSubmitting,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="newPassword">新しいパスワード</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full" variant="primary">
        {isSubmitting ? "設定中..." : "パスワードを再設定"}
      </Button>
    </form>
  );
}

function InvalidResetLink() {
  const navigate = useNavigate();
  return (
    <AppShell className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8 text-center">
          <p className="text-red-600">このリンクは無効です</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/forgot-password" })}>
            もう一度リクエストする
          </Button>
        </CardBody>
      </Card>
    </AppShell>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/reset-password" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateResetPassword({ newPassword, confirmPassword });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword({ newPassword, token });
      if (error) {
        toast.error("リンクの有効期限が切れているか、無効なリンクです");
      } else {
        toast.success("パスワードを再設定しました");
        navigate({ to: "/login" });
      }
    } catch {
      toast.error("リンクの有効期限が切れているか、無効なリンクです");
    }
    setIsSubmitting(false);
  };

  if (!token) return <InvalidResetLink />;

  return (
    <AppShell className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          <div className="mb-6 flex flex-col items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy">
              <KeyRound size={18} className="text-cream" aria-hidden="true" />
            </span>
            <h1 className="font-display text-3xl font-bold text-navy">新しいパスワードを設定</h1>
          </div>

          <ResetPasswordForm
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </CardBody>
      </Card>
    </AppShell>
  );
}
