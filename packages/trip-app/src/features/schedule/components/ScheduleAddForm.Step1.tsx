import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { EVENT_TYPE_LIST, type EventType } from "@/lib/eventTypes";

interface Step1FormProps {
  selectedType: EventType | "";
  onSelect: (type: EventType | "") => void;
  onNext: () => void;
  onCancel: () => void;
}

function EventTypeSelector({
  selectedType,
  onSelect,
}: {
  selectedType: EventType | "";
  onSelect: (type: EventType | "") => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-4 text-sm font-medium text-ink">イベントタイプを選択</legend>
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPE_LIST.map(({ key, label, icon: Icon, color }) => {
          const selected = selectedType === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(selected ? "" : key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                selected
                  ? "border-transparent text-white"
                  : "border-cream-dark bg-white text-ink-muted hover:border-ink-muted hover:text-ink"
              )}
              style={selected ? { backgroundColor: color, borderColor: color } : undefined}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Step1Form({ selectedType, onSelect, onNext, onCancel }: Step1FormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedType) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6">
        <EventTypeSelector selectedType={selectedType} onSelect={onSelect} />
      </div>
      <div
        className="sticky bottom-0 flex gap-3 bg-white -mx-6 px-6 pt-3 pb-4 border-t border-cream"
        style={{ paddingBottom: "max(1rem, var(--safe-area-inset-bottom))" }}
      >
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={!selectedType}>
          次へ
        </Button>
      </div>
    </form>
  );
}
