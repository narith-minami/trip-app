/**
 * src/components/layout/PageContainer.tsx
 *
 * Constrains page content to a centered, padded max width.
 */

import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto max-w-6xl px-4 py-6", className)} {...props} />;
}
