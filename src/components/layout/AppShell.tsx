/**
 * src/components/layout/AppShell.tsx
 *
 * Page-level shell with a sticky header and a main content area.
 */

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface AppShellProps {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShell({ header, children, className }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {header && <div className="bg-white shadow-sm">{header}</div>}
      <main>{children}</main>
    </div>
  );
}
