/**
 * src/components/auth/ResetPasswordForm.tsx
 *
 * Self-contained "set a new password" form for the reset-password page.
 * Owns its field state, validation and submit handling; takes the reset
 * token as a prop since that comes from the route's search params.
 */

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth-client";
import { validateNewPassword } from "@/lib/schemas/auth";

interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

function validateResetPassword({ newPassword, confirmPassword }: ResetPasswordValues) {
  if (!newPassword || !confirmPassword) return "すべての項目を入力してください";
  return validateNewPassword(newPassword, confirmPassword);
}

export function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
