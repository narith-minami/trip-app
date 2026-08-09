/**
 * src/features/memo/components/MemoSection.tsx
 *
 * Container for the trip detail "Memo" tab: a board of sticky-note memos any
 * trip member can add or edit, sorted by most recently updated first.
 */

import { QueryBoundary } from "@/components/feedback/QueryBoundary";
import { useMemos } from "@/features/memo/hooks/useMemos";
import { useSession } from "@/lib/auth-client";
import { MemoComposer } from "./MemoComposer";
import { MemoList } from "./MemoList";

export interface MemoSectionProps {
  tripId: string;
}

export function MemoSection({ tripId }: MemoSectionProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { data: memos, isLoading, error } = useMemos(tripId);

  return (
    <div className="flex flex-col gap-6">
      <MemoComposer tripId={tripId} />
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        loadingLabel="メモを読み込み中..."
        errorMessage="メモの読み込みに失敗しました。"
      >
        <MemoList tripId={tripId} memos={memos ?? []} currentUserId={currentUserId} />
      </QueryBoundary>
    </div>
  );
}
