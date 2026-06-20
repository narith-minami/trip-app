/**
 * src/components/feedback/EmptyState.tsx
 *
 * Placeholder shown when a list or section has no content yet.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("py-12 text-center", className)}>
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <p className="font-medium text-gray-900">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
