/**
 * src/routes/__root.tsx
 *
 * Root TanStack Router layout component.
 * Wraps the entire application with providers and global UI components.
 * Sets up query client, router, error boundaries, and notifications.
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { getQueryClient } from "@/lib/queryClient";

/**
 * Root layout component
 * Provides global context and UI for the entire application
 */
export function RootLayout() {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Main router outlet */}
      <Outlet />

      {/* Global toast notifications using sonner */}
      <Toaster position="bottom-center" richColors closeButton duration={3000} />
    </QueryClientProvider>
  );
}
