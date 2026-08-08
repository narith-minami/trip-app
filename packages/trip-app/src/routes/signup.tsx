/**
 * src/routes/signup.tsx
 *
 * Sign up page component.
 * Allows new users to create an account with email and password.
 * Redirects to /trips if already authenticated.
 */

import { useNavigate } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

export function SignupPage() {
  const navigate = useNavigate();
  const { isPending } = useRedirectIfAuthenticated();

  if (isPending) return <LoadingSpinner fullScreen />;

  return (
    <AuthCard icon={Home} title="アカウント作成">
      <SignupForm />

      <div className="mt-4 text-center">
        <p className="text-sm text-ink-muted">
          すでにアカウントをお持ちの方は{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="font-medium text-coral hover:text-coral-light"
          >
            ログイン
          </button>
        </p>
      </div>
    </AuthCard>
  );
}
