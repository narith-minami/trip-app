/**
 * src/mocks/auth-client.ts
 *
 * Mock Better Auth client.
 * Always returns authenticated session, skips login/signup.
 */

import { MOCK_USER, MOCK_SESSION } from "./seed";

export function useSession() {
  return {
    data: {
      user: MOCK_USER,
      session: MOCK_SESSION,
    },
    isPending: false,
    isRefetching: false,
    error: null,
    refetch: async () => {},
  };
}

export const signIn = {
  email: async (_: any) => {
    // no-op
  },
};

export const signUp = {
  email: async (_: any) => {
    // no-op
  },
};

export async function signOut() {
  // no-op
}

export async function getSession() {
  return {
    data: {
      user: MOCK_USER,
      session: MOCK_SESSION,
    },
  };
}

export const authClient = {
  getSession,
  useSession,
  signIn,
  signUp,
  signOut,
};
