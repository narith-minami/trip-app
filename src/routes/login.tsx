/**
 * src/routes/login.tsx
 *
 * Login page component.
 * Allows users to sign in with email and password.
 * Redirects to /trips if already authenticated.
 */

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LoginFormProps {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  isSubmitting,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
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

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full" variant="primary">
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: "/trips" });
    }
  }, [session, isPending, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("すべての項目を入力してください");
      return;
    }

    setIsSubmitting(true);
    // No try/finally: the catch swallows errors, so resetting the flag after
    // the try/catch runs on both success and failure (and stays React
    // Compiler friendly — it can't lower a `finally` clause).
    try {
      await signIn.email({ email, password });
      toast.success("ログインしました");
      navigate({ to: "/trips" });
    } catch {
      toast.error("メールアドレスまたはパスワードが正しくありません");
    }
    setIsSubmitting(false);
  };

  if (isPending) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>

        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/signup" })}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              新規登録
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
