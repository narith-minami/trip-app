/**
 * src/features/schedule/components/ScheduleCopyDialog.tsx
 *
 * 3-step dialog for copying schedule items from one date to another.
 * Step 1: Select items to copy
 * Step 2: Select target date
 * Step 3: Confirm and execute
 */

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import type { ScheduleItem } from "@/types/entities";
import { useState } from "react";

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

function formatDateLabel(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}月${d}日`;
}

interface DateButtonProps {
  dateStr: string;
  isSelected: boolean;
  onClick: () => void;
}

function DateButton({ dateStr, isSelected, onClick }: DateButtonProps) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
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

export interface ScheduleCopyDialogProps {
  sourceDate: string;
  items: ScheduleItem[];
  dates: string[];
  onCopy: (targetDate: string, itemIds: string[]) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

export function ScheduleCopyDialog({
  sourceDate,
  items,
  dates,
  onCopy,
  onClose,
  isSubmitting = false,
}: ScheduleCopyDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(items.map((i) => i.id)));
  const [targetDate, setTargetDate] = useState<string>("");

  const candidateDates = dates.filter((d) => d !== sourceDate);
  const allSelected = selectedIds.size === items.length;

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  async function handleConfirm() {
    await onCopy(targetDate, [...selectedIds]);
  }

  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  const stepTitle =
    step === 1 ? "コピーする予定を選択" : step === 2 ? "コピー先の日付を選択" : "コピーの確認";

  return (
    <Dialog open onClose={onClose} title={stepTitle} className="max-w-lg">
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">{formatDateLabel(sourceDate)}の予定</span>
            <button
              type="button"
              onClick={toggleAll}
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
                      onChange={() => toggleItem(item.id)}
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
            <Button onClick={() => setStep(2)} disabled={selectedIds.size === 0}>
              次へ
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
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
                  onClick={() => setTargetDate(d)}
                />
              ))}
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              戻る
            </Button>
            <Button onClick={() => setStep(3)} disabled={!targetDate}>
              次へ
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-ink">
            <span className="font-semibold">{formatDateLabel(sourceDate)}</span>
            {"の"}
            <span className="font-semibold">{selectedItems.length}件</span>
            {"の予定を"}
            <span className="font-semibold">{formatDateLabel(targetDate)}</span>
            {"にコピーします。"}
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
            <Button variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting}>
              戻る
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "コピー中..." : "コピーする"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
