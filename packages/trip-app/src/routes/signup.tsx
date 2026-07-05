/**
 * src/routes/signup.tsx
 *
 * Sign up page component.
 * Allows new users to create an account with email and password.
 * Redirects to /trips if already authenticated.
 */

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, useSession } from "@/lib/auth-client";

interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const LABEL_CLASS = "mb-1 block text-sm font-medium text-gray-700";

function validateSignup({ name, email, password, confirmPassword }: SignupValues): string | null {
  if (!name || !email || !password || !confirmPassword) return "すべての項目を入力してください";
  if (password !== confirmPassword) return "パスワードが一致しません";
  if (password.length < 8) return "パスワードは8文字以上にしてください";
  return null;
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
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
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

interface SignupFormProps {
  values: SignupValues;
  setField: (key: keyof SignupValues, value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function SignupForm({ values, setField, isSubmitting, onSubmit }: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

export function SignupPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const { values, setField, isSubmitting, handleSubmit } = useSignupForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: "/trips" });
    }
  }, [session, isPending, navigate]);

  if (isPending) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">アカウント作成</h1>

        <SignupForm
          values={values}
          setField={setField}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちの方は{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
