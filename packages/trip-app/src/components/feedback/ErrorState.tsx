/**
 * src/components/feedback/ErrorState.tsx
 *
 * EmptyState's twin for the "failed to load" case. Centered message with an
 * optional action (e.g. a 戻る button), and an optional `fullScreen` layout
 * for standalone detail pages (mirrors LoadingSpinner's `fullScreen` prop).
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  message: string;
  fullScreen?: boolean;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({ message, fullScreen = false, action, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen" : "py-12",
        className
      )}
    >
      <div className="text-center">
        <p className="text-red-600">{message}</p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
