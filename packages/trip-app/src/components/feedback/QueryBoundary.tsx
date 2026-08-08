/**
 * src/components/feedback/QueryBoundary.tsx
 *
 * Collapses the repeated `if (isLoading) return <LoadingSpinner />; if
 * (error) return <ErrorState />;` guard into one component for the common
 * case: a query whose fetched data is consumed with a `?? []`/`?? null`
 * fallback rather than needing non-null narrowing past this point. Pages
 * that need the fetched value narrowed to non-null (detail pages keying off
 * a single record) keep their own guard clause instead — wrapping those in
 * a children callback isn't worth the added indirection for 2-3 call sites.
 */

import type { ReactNode } from "react";
import { ErrorState } from "./ErrorState";
import { LoadingSpinner } from "./LoadingSpinner";

export interface QueryBoundaryProps {
  isLoading: boolean;
  error: unknown;
  loadingLabel?: string;
  errorMessage: string;
  fullScreen?: boolean;
  className?: string;
  children: ReactNode;
}

export function QueryBoundary({
  isLoading,
  error,
  loadingLabel,
  errorMessage,
  fullScreen = false,
  className,
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <LoadingSpinner label={loadingLabel} fullScreen={fullScreen} className={className} />;
  }
  if (error) {
    return <ErrorState message={errorMessage} fullScreen={fullScreen} className={className} />;
  }
  return <>{children}</>;
}
