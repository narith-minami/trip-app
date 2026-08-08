/**
 * src/components/ui/button.tsx
 *
 * Lightweight button primitive with a few visual variants.
 */

import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  // React 19: ref is a normal prop, no forwardRef needed.
  ref?: Ref<HTMLButtonElement>;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  // Darken (not lighten) on hover: coral/sage are already tuned to the
  // minimum contrast that keeps white text readable, so lightening on
  // hover would drop back below WCAG AA.
  primary: "bg-coral text-white hover:brightness-90",
  secondary: "border border-navy text-navy hover:bg-cream-mid",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-ink-muted hover:text-ink hover:bg-cream-mid",
  success: "bg-sage text-white hover:brightness-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "min-h-11 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-medium",
        "transition-[transform,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        "active:scale-[0.97] motion-reduce:active:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    />
  );
}
