/**
 * src/features/scraps/hooks/useTagInput.ts
 *
 * Manages the tag chip input: the current draft, the committed tag list, and
 * add/remove/keydown handlers with length and count validation.
 */

import { useState } from "react";
import { toast } from "sonner";
import { SCRAP_TAG_MAX, SCRAP_TAGS_MAX } from "@/lib/schemas/scrap";

export function useTagInput(initialTags: string[]) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (tag.length > SCRAP_TAG_MAX) {
      toast.error(`タグは${SCRAP_TAG_MAX}文字以内で入力してください`);
      return;
    }
    if (tags.includes(tag)) {
      setTagInput("");
      return;
    }
    if (tags.length >= SCRAP_TAGS_MAX) {
      toast.error(`タグは${SCRAP_TAGS_MAX}個までです`);
      return;
    }
    setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const resetTags = () => {
    setTags([]);
    setTagInput("");
  };

  return { tags, tagInput, setTagInput, addTag, removeTag, handleTagKeyDown, resetTags };
}
