/**
 * src/components/ui/tabs.tsx
 *
 * Minimal controlled tab bar primitive.
 */

import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onValueChange, className }: TabsProps) {
  return (
    <div className={cn("inline-flex rounded-full bg-cream-mid p-1", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onValueChange(item.value)}
          className={cn(
            "min-h-9 rounded-full px-4 text-sm font-medium",
            "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
            value === item.value ? "bg-white text-navy shadow-xs" : "text-ink-muted hover:text-ink"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
