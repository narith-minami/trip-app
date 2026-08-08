/**
 * src/routes/index.tsx
 *
 * Landing page component.
 * Redirects authenticated users to trips page, shows login for guests.
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { fetchCurrentUser } from "@/api/users";
import { AppShell } from "@/components/layout/PageLayout";

export function IndexPage() {
  const navigate = useNavigate();

  // Try to fetch current user to check if authenticated
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If authenticated, redirect to trips
        navigate({ to: "/trips" });
      } else {
        // If not authenticated, show login page
        navigate({ to: "/login" });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state
  return (
    <AppShell className="flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-coral" />
        <p className="text-ink-muted">読み込み中...</p>
      </div>
    </AppShell>
  );
}
