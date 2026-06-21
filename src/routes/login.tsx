/**
 * src/routes/login.tsx
 *
 * Login page component.
 * Allows users to sign in with email and password.
 * Redirects to /trips if already authenticated.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSession, signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn.email({
        email,
        password,
      });
      toast.success("Logged in successfully");
      navigate({ to: "/trips" });
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            variant="primary"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/signup" })}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
