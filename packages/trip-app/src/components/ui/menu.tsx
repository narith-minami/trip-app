/**
 * src/components/ui/menu.tsx
 *
 * Lightweight dropdown/floating menu primitives shared by triggers that
 * tuck a handful of low-frequency actions behind a single button (e.g. a
 * header's edit/delete actions, or a screen's secondary floating actions).
 */

import type { ComponentType, HTMLAttributes, Ref, RefObject } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function useCloseOnOutsideOrEscape(
  open: boolean,
  close: () => void,
  refs: RefObject<HTMLElement | null>[]
) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (refs.every((ref) => !ref.current?.contains(target))) close();
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
  }, [open, close, refs]);
}

/**
 * Screen position for a menu that needs to escape an `overflow: hidden`
 * ancestor (e.g. a hero header) by portaling to `document.body` and
 * positioning itself with `position: fixed` off the trigger's own rect,
 * rather than `position: absolute` inside the clipped container.
 *
 * This can't be computed during render: `getBoundingClientRect()` needs the
 * trigger's real layout, which only exists once refs are attached post-commit.
 * useLayoutEffect (not useEffect) measures and applies it before the browser
 * paints, so there's no visible frame with the menu in the wrong place.
 */
export function useMenuPosition(open: boolean, triggerRef: RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPosition(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
  }, [open, triggerRef]);

  return position;
}

// React 19: ref is a normal prop, no forwardRef needed.
export function MenuPanel({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
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
