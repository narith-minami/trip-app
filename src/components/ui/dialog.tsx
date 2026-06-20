/**
 * src/components/ui/dialog.tsx
 *
 * Simple modal dialog rendered as a centered overlay.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className={cn("w-full max-w-md rounded-lg bg-white p-6 shadow-xl", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-4 text-2xl font-bold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
