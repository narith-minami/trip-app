import type { ScheduleItem } from "@/types/entities";

interface UnscheduledItemsProps {
  items: ScheduleItem[];
  onDelete: (id: string) => void;
}

export function UnscheduledItems({ items, onDelete }: UnscheduledItemsProps) {
  if (items.length === 0) return null;
  return (
    <section className="shrink-0 border-b bg-white px-4 py-2">
      <p className="mb-1 text-xs text-ink-muted">時刻未設定</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-sm text-ink"
          >
            {item.title}
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="ml-1 text-ink-muted hover:text-red-500"
              aria-label="削除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
