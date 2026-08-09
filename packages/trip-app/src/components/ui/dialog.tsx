/**
 * src/components/ui/dialog.tsx
 *
 * Simple modal dialog rendered as a centered overlay.
 */

import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Keep in sync with the animate-[dialog-*-in_...] durations below.
const CLOSE_ANIMATION_MS = 220;

/**
 * Keeps the dialog mounted for one extra `CLOSE_ANIMATION_MS` tick after
 * `open` goes false, so the closing animation can play instead of the
 * dialog vanishing instantly.
 */
function useDialogVisibility(open: boolean) {
  // This is React's documented "adjust state during render" pattern (a
  // prevProp comparison, not a stale one-time copy) — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  // prevOpen must be useState, not useRef: refs can't be written during
  // render, which is exactly where this comparison needs to run.
  // react-doctor-disable-next-line react-doctor/no-derived-useState, react-doctor/rerender-state-only-in-handlers
  const [prevOpen, setPrevOpen] = useState(open);
  // Kept in sync via the prevOpen-comparison render adjustment below, not a one-time copy.
  // react-doctor-disable-next-line react-doctor/no-derived-useState
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  // Adjust state during render when `open` changes (rather than syncing via
  // an effect, per AGENTS.md #2) so there's no extra stale-UI render between
  // the prop flipping and the dialog reacting to it.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }

  // Side effect (not a prop→state sync): once the closing animation starts,
  // actually unmount after it finishes.
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, CLOSE_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  return { mounted, closing };
}

/**
 * Closes on Escape for keyboard users. Shared by Dialog and any other
 * modal-like overlay (e.g. ImageLightbox) so there's one Escape listener
 * implementation.
 *
 * NOTE: react-doctor's prefer-use-effect-event suggests wrapping `onClose` in
 * useEffectEvent so the listener isn't re-subscribed on a new callback
 * identity. That's deferred — the pinned react-hooks (5.2.0) and
 * react-compiler ESLint plugins don't yet recognise useEffectEvent, so it
 * produces false exhaustive-deps / react-compiler errors. Suppressed in
 * doctor.config.ts until the toolchain supports it.
 */
export function useEscapeKey(enabled: boolean, onClose: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onClose]);
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const titleId = useId();
  const { mounted, closing } = useDialogVisibility(open);

  useEscapeKey(open, onClose);

  if (!mounted) return null;

  // Tailwind's JIT scanner needs complete, literal class strings — it can't
  // resolve a template-interpolated arbitrary value — so the open/closing
  // variants are two full class names rather than one with an injected
  // "_reverse" suffix.
  const overlayAnimation = closing
    ? "motion-safe:animate-[dialog-overlay-in_var(--duration-base)_var(--ease-standard)_reverse]"
    : "motion-safe:animate-[dialog-overlay-in_var(--duration-base)_var(--ease-standard)]";
  const panelAnimation = closing
    ? "motion-safe:animate-[dialog-panel-in_var(--duration-base)_var(--ease-spring)_reverse]"
    : "motion-safe:animate-[dialog-panel-in_var(--duration-base)_var(--ease-spring)]";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4",
        overlayAnimation
      )}
      onClick={onClose}
      role="presentation"
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl max-h-[90dvh]",
          panelAnimation,
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
