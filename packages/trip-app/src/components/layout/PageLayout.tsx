/**
 * src/components/layout/PageLayout.tsx
 *
 * Shared page-shell primitives. Co-located (like ui/input.tsx's
 * Input/Textarea/Label) so routes only pay one import-dependency slot for
 * both: AppShell is the full-viewport background, PageContainer is the
 * centered max-width content wrapper that goes inside it.
 */

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function AppShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-h-screen bg-cream", "pt-[env(safe-area-inset-top)]", className)}
      {...props}
    />
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp -- co-located page-shell primitives are an intentional design-system grouping
export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-4xl px-4 py-6",
        "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        className
      )}
      {...props}
    />
  );
}
