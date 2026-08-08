/**
 * src/components/ui/checkbox.tsx
 *
 * Brand-styled checkbox wrapped in a 44x44 hit area, replacing raw
 * `<input type="checkbox">` usages that render inconsistently across
 * browsers and are too small to tap reliably on touch devices.
 */

import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  wrapperClassName?: string;
}

// React 19: ref is a normal prop, no forwardRef needed.
export function Checkbox({ className, wrapperClassName, ref, ...props }: CheckboxProps) {
  return (
    <span
      className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center", wrapperClassName)}
    >
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "h-5 w-5 rounded border-cream-dark text-coral",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    </span>
  );
}
