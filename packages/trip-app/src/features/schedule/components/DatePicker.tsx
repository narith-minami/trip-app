import { cn } from "@/lib/cn";

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

interface DateCardProps {
  dateStr: string;
  isSelected: boolean;
  hasItems: boolean;
  alertCount: number;
  onClick: () => void;
}

function DateCard({ dateStr, isSelected, hasItems, alertCount, onClick }: DateCardProps) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2.5 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
        isSelected
          ? "bg-navy text-white"
          : "border border-cream-dark bg-white text-ink hover:bg-cream"
      )}
    >
      {alertCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
          <span className="sr-only">未設定の予定あり</span>!
        </span>
      )}
      <span className={cn("text-xs", isSelected ? "text-cream-mid" : "text-ink-muted")}>{dow}</span>
      <span
        className={cn("text-2xl font-bold leading-tight", isSelected ? "text-white" : "text-ink")}
      >
        {d}
      </span>
      <span
        className="mt-1.5 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hasItems ? "#FF6B47" : "transparent" }}
      />
    </button>
  );
}

interface DatePickerProps {
  dates: string[];
  selectedDate: string;
  datesWithItems: Set<string>;
  alertCountByDate: Map<string, number>;
  onSelect: (d: string) => void;
}

export function DatePicker({
  dates,
  selectedDate,
  datesWithItems,
  alertCountByDate,
  onSelect,
}: DatePickerProps) {
  if (dates.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm text-ink-muted">日付を選択</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((d) => (
          <DateCard
            key={d}
            dateStr={d}
            isSelected={d === selectedDate}
            hasItems={datesWithItems.has(d)}
            alertCount={alertCountByDate.get(d) ?? 0}
            onClick={() => onSelect(d)}
          />
        ))}
      </div>
    </div>
  );
}
