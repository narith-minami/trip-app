/**
 * src/components/auth/SignupForm.tsx
 *
 * Self-contained signup form: owns its field state, validation and submit
 * handling so the signup page itself only composes the page shell.
 */

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { validateNewPassword } from "@/lib/schemas/auth";

interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function validateSignup({ name, email, password, confirmPassword }: SignupValues): string | null {
  if (!name || !email || !password || !confirmPassword) return "すべての項目を入力してください";
  return validateNewPassword(password, confirmPassword);
}

function useSignupForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignupValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key: keyof SignupValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateSignup(values);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    // No try/finally: the catch swallows errors, so resetting the flag after
    // the try/catch runs on both success and failure (and stays React
    // Compiler friendly — it can't lower a `finally` clause).
    try {
      await signUp.email({ email: values.email, password: values.password, name: values.name });
      toast.success("アカウントを作成しました");
      navigate({ to: "/trips" });
    } catch {
      toast.error("アカウントの作成に失敗しました");
    }
    setIsSubmitting(false);
  };

  return { values, setField, isSubmitting, handleSubmit };
}

interface SignupFieldProps {
  id: keyof SignupValues;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function SignupField({
  id,
  label,
  type,
  placeholder,
  value,
  disabled,
  onChange,
}: SignupFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
      />
    </div>
  );
}

export function SignupForm() {
  const { values, setField, isSubmitting, handleSubmit } = useSignupForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SignupField
        id="name"
        label="名前"
        type="text"
        placeholder="山田太郎"
        value={values.name}
        disabled={isSubmitting}
        onChange={(v) => setField("name", v)}
      />
      <SignupField
        id="email"
        label="メールアドレス"
        type="email"
        placeholder="you@example.com"
        value={values.email}
        disabled={isSubmitting}
        onChange={(v) => setField("email", v)}
      />
      <SignupField
        id="password"
        label="パスワード"
        type="password"
        placeholder="••••••••"
        value={values.password}
        disabled={isSubmitting}
        onChange={(v) => setField("password", v)}
      />
      <SignupField
        id="confirmPassword"
        label="パスワード（確認）"
        type="password"
        placeholder="••••••••"
        value={values.confirmPassword}
        disabled={isSubmitting}
        onChange={(v) => setField("confirmPassword", v)}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full" variant="primary">
        {isSubmitting ? "作成中..." : "新規登録"}
      </Button>
    </form>
  );
}
