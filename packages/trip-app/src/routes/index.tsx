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
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}
