/**
 * src/components/ui/input.tsx
 *
 * Text input and textarea primitives with shared styling.
 */

import type { InputHTMLAttributes, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const FIELD_BASE_CLASSES =
  "px-3 py-2 border border-cream-dark rounded-lg transition-shadow duration-[var(--duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-coral";
// Input/Textarea default to full width; Select doesn't (it's commonly one of
// several inline controls in a row), so it's built from the base directly.
const FIELD_CLASSES = cn("w-full", FIELD_BASE_CLASSES);

// React 19: ref is a normal prop, no forwardRef needed.
export function Input({
  className,
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} className={cn(FIELD_CLASSES, className)} {...props} />;
}

// react-doctor-disable-next-line react-doctor/no-multi-comp -- co-located form-field primitives are an intentional design-system grouping
export function Textarea({
  className,
  ref,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  return <textarea ref={ref} className={cn(FIELD_CLASSES, className)} {...props} />;
}

// react-doctor-disable-next-line react-doctor/no-multi-comp -- co-located form-field primitives are an intentional design-system grouping
export function Select({
  className,
  ref,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> }) {
  return <select ref={ref} className={cn(FIELD_BASE_CLASSES, className)} {...props} />;
}

// react-doctor-disable-next-line react-doctor/no-multi-comp -- co-located form-field primitives are an intentional design-system grouping
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: generic label primitive; callers associate it with a control via the spread `htmlFor` prop
    <label className={cn("block text-sm font-semibold text-ink mb-1", className)} {...props} />
  );
}
