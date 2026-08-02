/**
 * src/components/ui/dialog.tsx
 *
 * Simple modal dialog rendered as a centered overlay.
 */

import type { ReactNode } from "react";
import { useEffect, useId } from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const titleId = useId();

  // Close on Escape for keyboard users.
  // NOTE: react-doctor's prefer-use-effect-event suggests wrapping `onClose` in
  // useEffectEvent so the listener isn't re-subscribed on a new callback
  // identity. That's deferred — the pinned react-hooks (5.2.0) and
  // react-compiler ESLint plugins don't yet recognise useEffectEvent, so it
  // produces false exhaustive-deps / react-compiler errors. Suppressed in
  // doctor.config.ts until the toolchain supports it.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") onClose();
      }}
      role="presentation"
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl max-h-[90dvh]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="shrink-0 px-6 pt-6">
            <h2 id={titleId} className="text-2xl font-bold">
              {title}
            </h2>
          </div>
        )}
        <div className={cn("flex-1 overflow-y-auto p-6", title != null && "pt-4")}>{children}</div>
      </div>
    </div>
  );
}
