/**
 * src/components/feedback/LoadingSpinner.tsx
 *
 * Centered loading spinner with an optional label.
 */

import { cn } from "@/lib/cn";

export interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  label = "読み込み中...",
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen" : "py-12",
        className
      )}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-coral" />
        {label && <p className="text-ink-muted">{label}</p>}
      </div>
    </div>
  );
}
