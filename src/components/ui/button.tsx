/**
 * src/components/ui/button.tsx
 *
 * Lightweight button primitive with a few visual variants.
 */

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, Ref } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  // React 19: ref is a normal prop, no forwardRef needed.
  ref?: Ref<HTMLButtonElement>;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-coral text-white hover:bg-coral-light",
  secondary: "border border-navy text-navy hover:bg-cream-mid",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-ink-muted hover:text-ink hover:bg-cream-mid",
  success: "bg-sage text-white hover:opacity-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
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
        "inline-flex items-center justify-center rounded-2xl font-medium transition disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    />
  );
}
