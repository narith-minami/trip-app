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
    <div className={cn("flex border-b border-cream-dark", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onValueChange(item.value)}
          className={cn(
            "px-4 py-2 font-medium transition",
            value === item.value
              ? "border-b-2 border-coral text-coral"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
