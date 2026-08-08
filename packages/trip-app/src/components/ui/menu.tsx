/**
 * src/components/ui/menu.tsx
 *
 * Lightweight dropdown/floating menu primitives shared by triggers that
 * tuck a handful of low-frequency actions behind a single button (e.g. a
 * header's edit/delete actions, or a screen's secondary floating actions).
 */

import type { ComponentType, HTMLAttributes, RefObject } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";

export function useCloseOnOutsideOrEscape(
  open: boolean,
  close: () => void,
  containerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close, containerRef]);
}

export function MenuPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="menu"
      className={cn(
        "flex w-56 flex-col overflow-hidden rounded-2xl bg-white py-1 text-left shadow-lg",
        "motion-safe:animate-[dialog-panel-in_var(--duration-base)_var(--ease-spring)]",
        className
      )}
      {...props}
    />
  );
}

export interface MenuItemProps {
  icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
        danger ? "text-red-600 hover:bg-red-50" : "text-ink hover:bg-cream-mid"
      )}
    >
      {Icon && <Icon size={16} aria-hidden={true} />}
      {label}
    </button>
  );
}
