/**
 * src/routes/login.tsx
 *
 * Login page component.
 * Allows users to sign in with email and password.
 * Redirects to /trips if already authenticated.
 */

import { useNavigate } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { AppShell } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { signIn, useSession } from "@/lib/auth-client";

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

      <div>
        <Label htmlFor="password">パスワード</Label>
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
    <AppShell className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          <div className="mb-6 flex flex-col items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy">
              <Home size={18} className="text-cream" aria-hidden="true" />
            </span>
            <h1 className="font-display text-3xl font-bold text-navy">ログイン</h1>
          </div>

          <LoginForm
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />

          <div className="mt-4 text-center">
            <p className="text-sm text-ink-muted">
              アカウントをお持ちでない方は{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/signup" })}
                className="font-medium text-coral hover:text-coral-light"
              >
                新規登録
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  );
}
