/**
 * src/routes/scraps/index.tsx
 *
 * Scraps page — a standalone "anything memo" board not tied to any trip.
 * Any authenticated user can browse every scrap and filter by free word,
 * tag, and author.
 */

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ScrapComposer } from "@/features/scraps/components/ScrapComposer";
import { type AuthorOption, ScrapFilters } from "@/features/scraps/components/ScrapFilters";
import { ScrapList } from "@/features/scraps/components/ScrapList";
import { useScraps } from "@/features/scraps/hooks/useScraps";
import { useSession } from "@/lib/auth-client";
import type { Scrap } from "@/types/entities";

function ScrapsHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="旅行一覧に戻る">
          ← 戻る
        </Button>
        <h1 className="font-display text-xl font-semibold text-navy">スクラップ</h1>
      </div>
    </div>
  );
}

function uniqueTags(scraps: Scrap[]): string[] {
  return [...new Set(scraps.flatMap((s) => s.tags))].sort((a, b) => a.localeCompare(b, "ja"));
}

function uniqueAuthors(scraps: Scrap[]): AuthorOption[] {
  const map = new Map<string, string>();
  for (const s of scraps) {
    if (!map.has(s.authorId)) {
      map.set(s.authorId, s.author?.name ?? "不明");
    }
  }
  return [...map.entries()].map(([id, name]) => ({ id, name }));
}

function matchesAuthor(scrap: Scrap, authorId: string): boolean {
  return !authorId || scrap.authorId === authorId;
}

function matchesTags(scrap: Scrap, tags: string[]): boolean {
  return tags.length === 0 || tags.every((t) => scrap.tags.includes(t));
}

function matchesQuery(scrap: Scrap, q: string): boolean {
  if (!q) return true;
  return (
    (scrap.content ?? "").toLowerCase().includes(q) ||
    scrap.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function ScrapsPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const currentUserId = session?.user?.id;

  const { data: scraps, isLoading, error } = useScraps({ enabled: !!session });

  const [freeword, setFreeword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState("");

  // Redirect unauthenticated visitors to login (mirrors IndexPage).
  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/login" });
    }
  }, [isPending, session, navigate]);

  const allScraps = useMemo(() => scraps ?? [], [scraps]);
  const allTags = useMemo(() => uniqueTags(allScraps), [allScraps]);
  const authors = useMemo(() => uniqueAuthors(allScraps), [allScraps]);

  const filtered = useMemo(() => {
    const q = freeword.trim().toLowerCase();
    return allScraps.filter(
      (scrap) =>
        matchesAuthor(scrap, selectedAuthorId) &&
        matchesTags(scrap, selectedTags) &&
        matchesQuery(scrap, q)
    );
  }, [allScraps, freeword, selectedTags, selectedAuthorId]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  if (isPending || isLoading) return <LoadingSpinner fullScreen label="スクラップを読み込み中..." />;

  return (
    <div className="min-h-screen bg-cream">
      <ScrapsHeader onBack={() => navigate({ to: "/trips" })} />
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
        <ScrapComposer />

        <ScrapFilters
          freeword={freeword}
          onFreewordChange={setFreeword}
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          authors={authors}
          selectedAuthorId={selectedAuthorId}
          onAuthorChange={setSelectedAuthorId}
        />

        {error ? (
          <p className="py-8 text-center text-red-600">スクラップの読み込みに失敗しました</p>
        ) : (
          <ScrapList scraps={filtered} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
