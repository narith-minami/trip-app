/**
 * src/components/ui/badge.tsx
 *
 * Small pill label for status/tag/count indicators. Consolidates the ad hoc
 * `rounded-full px-2.5 py-0.5 text-xs` pill markup duplicated across
 * TripCard, TodoItem, ScrapCard, and DatePicker.
 */

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "coral" | "sage" | "gold" | "navy" | "custom";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-cream-dark text-ink-muted",
  coral: "bg-coral/10 text-coral",
  sage: "bg-sage/10 text-sage",
  gold: "bg-gold/10 text-gold",
  navy: "bg-cream-mid text-navy",
  // No color classes — caller supplies bg/text via `style` or `className`
  // (e.g. per-tag colors computed at runtime).
  custom: "",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
