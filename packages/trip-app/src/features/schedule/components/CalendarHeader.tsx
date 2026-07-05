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
    <header className="flex shrink-0 items-center justify-between bg-white px-4 py-3 shadow-sm">
      <button type="button" onClick={onBack} className="text-sm font-medium text-ink-muted">
        ← 戻る
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => prevDate && onSelectDate(prevDate)}
          disabled={!prevDate}
          className="text-xl text-ink disabled:opacity-30"
          aria-label="前の日"
        >
          ‹
        </button>
        <h1 className="min-w-[96px] text-center font-bold text-ink">
          {formatDayHeading(currentDate)}
        </h1>
        <button
          type="button"
          onClick={() => nextDate && onSelectDate(nextDate)}
          disabled={!nextDate}
          className="text-xl text-ink disabled:opacity-30"
          aria-label="次の日"
        >
          ›
        </button>
      </div>
      <div className="w-12" />
    </header>
  );
}
