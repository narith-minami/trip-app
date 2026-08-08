/**
 * src/mocks/auth-client.ts
 *
 * Mock Better Auth client.
 * Always returns authenticated session, skips login/signup.
 */

import { MOCK_SESSION, MOCK_USER } from "./seed";

export function useSession() {
  return {
    data: {
      user: MOCK_USER,
      session: MOCK_SESSION,
    },
    isPending: false,
    isRefetching: false,
    error: null,
    refetch: async () => {
      // no-op: mock always returns fresh data
    },
  };
}

export const signIn = {
  email: async (_: unknown) => {
    // no-op
  },
};

export const signUp = {
  email: async (_: unknown) => {
    // no-op
  },
};

export async function signOut() {
  // no-op
}

export async function requestPasswordReset(_: unknown) {
  // no-op: mock always reports success without sending an email
  return { data: { status: true }, error: null };
}

export async function resetPassword(_: unknown) {
  // no-op
  return { data: { status: true }, error: null };
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
  requestPasswordReset,
  resetPassword,
};
