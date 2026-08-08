/**
 * src/components/layout/PageHeaderBar.tsx
 *
 * White app-bar with a back button and page title, used by standalone
 * detail/list pages (as opposed to tabs nested inside the trip detail page).
 */

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PageHeaderBarProps {
  title: string;
  /** Accessible label for the back button (e.g. "Todo一覧に戻る"). */
  backLabel: string;
  onBack: () => void;
}

export function PageHeaderBar({ title, backLabel, onBack }: PageHeaderBarProps) {
  return (
    <div className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label={backLabel}>
          <span className="inline-flex items-center gap-1">
            <ChevronLeft size={16} aria-hidden="true" />
            戻る
          </span>
        </Button>
        <h1 className="font-display text-xl font-semibold text-navy">{title}</h1>
      </div>
    </div>
  );
}
