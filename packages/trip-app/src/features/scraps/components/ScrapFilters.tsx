/**
 * src/features/scraps/components/ScrapFilters.tsx
 *
 * Filter controls for the scraps list: free-word search, tag toggles and an
 * author picker.
 */

import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export interface AuthorOption {
  id: string;
  name: string;
}

interface ScrapFiltersProps {
  freeword: string;
  onFreewordChange: (value: string) => void;
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  authors: AuthorOption[];
  selectedAuthorId: string;
  onAuthorChange: (id: string) => void;
}

export function ScrapFilters({
  freeword,
  onFreewordChange,
  allTags,
  selectedTags,
  onToggleTag,
  authors,
  selectedAuthorId,
  onAuthorChange,
}: ScrapFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={freeword}
          onChange={(e) => onFreewordChange(e.target.value)}
          placeholder="フリーワード検索..."
          aria-label="フリーワード検索"
          className="flex-1"
        />
        <Select
          value={selectedAuthorId}
          onChange={(e) => onAuthorChange(e.target.value)}
          aria-label="投稿者で絞り込み"
        >
          <option value="">すべての投稿者</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </Select>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                  selected
                    ? "border-transparent bg-coral text-white"
                    : "border-cream-dark bg-white text-ink-muted hover:border-ink-muted hover:text-ink"
                )}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
