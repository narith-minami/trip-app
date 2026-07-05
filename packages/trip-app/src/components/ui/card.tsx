/**
 * src/components/ui/card.tsx
 *
 * Simple surface containers for grouping content.
 */

import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-white rounded-2xl shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 border-b border-cream-dark", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  // react-doctor-disable-next-line react-doctor/heading-has-content -- generic <h3> primitive; callers supply heading text via children
  return <h3 className={cn("text-lg font-semibold text-ink", className)} {...props} />;
}
