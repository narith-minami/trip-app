/**
 * src/lib/queryClient.ts
 *
 * TanStack Query client configuration.
 * Creates a singleton QueryClient instance with sensible defaults.
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Create a QueryClient with sensible defaults
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 1000 * 60 * 5,
        // Unused data is garbage collected after 10 minutes
        gcTime: 1000 * 60 * 10,
        // Retry failed queries up to 2 times
        retry: 2,
        // Don't retry on 4xx errors (client errors)
        retryOnMount: true,
      },
      mutations: {
        // Retry mutations up to 1 time
        retry: 1,
      },
    },
  });
}

/**
 * Singleton QueryClient instance
 */
let queryClient: QueryClient | undefined;

/**
 * Get or create the singleton QueryClient
 */
export function getQueryClient() {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
}

/**
 * Export the query client as default
 */
export default getQueryClient();
