import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDayHeading } from "./calendarLayout";

interface CalendarHeaderProps {
  currentDate: string;
  prevDate: string | null;
  nextDate: string | null;
  onBack: () => void;
  onSelectDate: (date: string) => void;
}

export function CalendarHeader({
  currentDate,
  prevDate,
  nextDate,
  onBack,
  onSelectDate,
}: CalendarHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between bg-white/80 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        戻る
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => prevDate && onSelectDate(prevDate)}
          disabled={!prevDate}
          className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
          aria-label="前の日"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="min-w-[96px] text-center font-bold text-ink">
          {formatDayHeading(currentDate)}
        </h1>
        <button
          type="button"
          onClick={() => nextDate && onSelectDate(nextDate)}
          disabled={!nextDate}
          className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
          aria-label="次の日"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="w-12" />
    </header>
  );
}
