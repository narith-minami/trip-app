/**
 * src/hooks/useRedirectIfAuthenticated.ts
 *
 * Redirects to /trips once an authenticated session resolves — used by the
 * login/signup pages so an already-logged-in visitor doesn't see the form.
 */

import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: "/trips" });
    }
  }, [session, isPending, navigate]);

  return { isPending };
}
