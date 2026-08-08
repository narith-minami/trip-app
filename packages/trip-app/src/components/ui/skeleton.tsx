/**
 * src/components/ui/skeleton.tsx
 *
 * Pulsing placeholder block for loading states, as a lighter-weight
 * alternative to a full-screen LoadingSpinner on list/detail views.
 */

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-cream-dark motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}
