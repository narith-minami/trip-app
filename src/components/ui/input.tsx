/**
 * src/components/ui/input.tsx
 *
 * Text input and textarea primitives with shared styling.
 */

import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from "react";

const FIELD_CLASSES =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

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
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: generic label primitive; callers associate it with a control via the spread `htmlFor` prop
    <label className={cn("block text-sm font-medium text-gray-700 mb-1", className)} {...props} />
  );
}
