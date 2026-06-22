/**
 * src/components/ui/dialog.tsx
 *
 * Simple modal dialog rendered as a centered overlay.
 */

import { cn } from "@/lib/cn";
import { useEffect, useId } from "react";
import type { ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
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
      role="presentation"
    >
      {/* biome-ignore lint/a11y/useSemanticElements: custom overlay modal; native <dialog> is not used so its imperative API/backdrop behaviour can be controlled manually */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn("w-full max-w-md rounded-lg bg-white p-6 shadow-xl", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id={titleId} className="mb-4 text-2xl font-bold">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
