/**
 * src/features/scraps/components/ScrapList.tsx
 *
 * Responsive grid of scrap cards with an empty state.
 */

import type { Scrap } from "@/types/entities";
import { ScrapCard } from "./ScrapCard";

interface ScrapListProps {
  scraps: Scrap[];
  currentUserId?: string;
}

export function ScrapList({ scraps, currentUserId }: ScrapListProps) {
  if (scraps.length === 0) {
    return (
      <div className="py-12 text-center text-ink-muted">条件に一致するスクラップがありません。</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {scraps.map((scrap) => (
        <ScrapCard key={scrap.id} scrap={scrap} isAuthor={scrap.authorId === currentUserId} />
      ))}
    </div>
  );
}
