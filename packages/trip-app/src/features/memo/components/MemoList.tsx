/**
 * src/features/memo/components/MemoList.tsx
 *
 * Grid of memo (sticky note) cards with an empty state.
 */

import type { TripMemo } from "@/types/entities";
import { MemoCard } from "./MemoCard";

interface MemoListProps {
  tripId: string;
  memos: TripMemo[];
  currentUserId?: string;
}

export function MemoList({ tripId, memos, currentUserId }: MemoListProps) {
  if (memos.length === 0) {
    return <div className="py-12 text-center text-ink-muted">まだメモがありません。</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {memos.map((memo) => (
        <MemoCard
          key={memo.id}
          tripId={tripId}
          memo={memo}
          isCreator={memo.createdBy === currentUserId}
        />
      ))}
    </div>
  );
}
