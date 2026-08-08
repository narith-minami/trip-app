/**
 * src/features/facilities/components/FacilitySearchPanel.tsx
 *
 * Keyword search box for looking up a facility's name/address/phone/URL
 * via an external API, so the caller can autofill the registration form.
 */

import { Search } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { FacilitySearchResult } from "@/api/facilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFacilitySearch } from "../hooks/useFacilitySearch";

export interface FacilitySearchPanelProps {
  tripId: string;
  onSelect: (result: FacilitySearchResult) => void;
}

export function FacilitySearchPanel({ tripId, onSelect }: FacilitySearchPanelProps) {
  const [keyword, setKeyword] = useState("");
  const { results, isSearching, search, reset } = useFacilitySearch(tripId);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    search(keyword.trim());
  };

  const handleSelect = (result: FacilitySearchResult) => {
    onSelect(result);
    reset();
    setKeyword("");
  };

  return (
    <div className="rounded-xl border border-cream-dark bg-cream-mid/40 p-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="施設名で検索（例：東京タワー）"
          aria-label="施設をキーワードで検索"
          className="bg-white"
        />
        <Button type="submit" variant="secondary" disabled={isSearching || !keyword.trim()}>
          <Search size={16} className="mr-1.5" />
          {isSearching ? "検索中..." : "検索"}
        </Button>
      </form>

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((result, index) => (
            // Search results have no stable ID; index is safe since the list
            // is fully replaced on each new search rather than reordered.
            // biome-ignore lint/suspicious/noArrayIndexKey: replaced wholesale per search, not reordered
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full rounded-lg border border-cream-dark bg-white p-2.5 text-left text-sm transition-colors hover:border-coral"
              >
                <p className="font-medium text-ink">{result.name}</p>
                {result.address && <p className="text-ink-muted">{result.address}</p>}
                {result.phone && <p className="text-ink-muted">{result.phone}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
