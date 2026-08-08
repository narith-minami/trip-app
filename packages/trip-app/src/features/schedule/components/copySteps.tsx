import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatMD, JA_DOW, parseLocalDate } from "@/lib/japaneseDate";
import type { ScheduleItem } from "@/types/entities";

interface DateButtonProps {
  dateStr: string;
  isSelected: boolean;
  onClick: () => void;
}

function DateButton({ dateStr, isSelected, onClick }: DateButtonProps) {
  const date = parseLocalDate(dateStr);
  const d = date.getDate();
  const dow = JA_DOW[date.getDay()];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2.5 transition-all",
        isSelected
          ? "bg-navy text-white"
          : "border border-cream-dark bg-white text-ink hover:bg-cream"
      )}
    >
      <span className={cn("text-xs", isSelected ? "text-cream-mid" : "text-ink-muted")}>{dow}</span>
      <span
        className={cn("text-2xl font-bold leading-tight", isSelected ? "text-white" : "text-ink")}
      >
        {d}
      </span>
    </button>
  );
}

interface CopyStepItemsProps {
  sourceDate: string;
  items: ScheduleItem[];
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleItem: (id: string) => void;
  onToggleAll: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function CopyStepItems({
  sourceDate,
  items,
  selectedIds,
  allSelected,
  onToggleItem,
  onToggleAll,
  onNext,
  onClose,
}: CopyStepItemsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{formatMD(sourceDate)}の予定</span>
        <button
          type="button"
          onClick={onToggleAll}
          className="text-sm text-blue-600 hover:underline"
        >
          {allSelected ? "すべて解除" : "すべて選択"}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">この日の予定がありません</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-cream-dark p-3 hover:bg-cream">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => onToggleItem(item.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{item.title}</p>
                  {(item.startTime ?? item.placeName) && (
                    <p className="truncate text-xs text-ink-muted">
                      {item.startTime && <span>{item.startTime}</span>}
                      {item.startTime && item.placeName && <span> · </span>}
                      {item.placeName && <span>{item.placeName}</span>}
                    </p>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={onNext} disabled={selectedIds.size === 0}>
          次へ
        </Button>
      </div>
    </div>
  );
}

interface CopyStepTargetDateProps {
  candidateDates: string[];
  targetDate: string;
  onSelect: (date: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CopyStepTargetDate({
  candidateDates,
  targetDate,
  onSelect,
  onBack,
  onNext,
}: CopyStepTargetDateProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">コピー先の日付を選んでください</p>
      {candidateDates.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">コピー先の日付がありません</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {candidateDates.map((d) => (
            <DateButton
              key={d}
              dateStr={d}
              isSelected={d === targetDate}
              onClick={() => onSelect(d)}
            />
          ))}
        </div>
      )}
      <div className="flex justify-between gap-2 pt-2">
        <Button variant="ghost" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={onNext} disabled={!targetDate}>
          次へ
        </Button>
      </div>
    </div>
  );
}

interface CopyStepConfirmProps {
  sourceDate: string;
  targetDate: string;
  selectedItems: ScheduleItem[];
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function CopyStepConfirm({
  sourceDate,
  targetDate,
  selectedItems,
  isSubmitting,
  onConfirm,
  onBack,
}: CopyStepConfirmProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink">
        <span className="font-semibold">{formatMD(sourceDate)}</span>の
        <span className="font-semibold">{selectedItems.length}件</span>の予定を
        <span className="font-semibold">{formatMD(targetDate)}</span>にコピーします。
      </p>
      <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg bg-cream p-3">
        {selectedItems.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm text-ink">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />
            <span className="truncate">{item.title}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between gap-2 pt-2">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          戻る
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "コピー中..." : "コピーする"}
        </Button>
      </div>
    </div>
  );
}
