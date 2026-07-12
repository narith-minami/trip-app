/**
 * src/features/scraps/components/ScrapForm.tsx
 *
 * Shared create/edit form for a scrap: body text, optional image (read as a
 * base64 data URL), and free-form tags. Used by ScrapComposer (create) and
 * ScrapCard (inline edit).
 */

import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { type ScrapFormData, useScrapForm } from "@/features/scraps/hooks/useScrapForm";
import { cn } from "@/lib/cn";
import { SCRAP_CONTENT_MAX } from "@/lib/schemas/scrap";

export type { ScrapFormData };

interface ScrapFormProps {
  initial?: Partial<ScrapFormData>;
  submitLabel: string;
  onSubmit: (data: ScrapFormData) => Promise<void>;
  onCancel?: () => void;
  resetOnSubmit?: boolean;
}

function ImageField({
  imageData,
  onFile,
  onClear,
}: {
  imageData: string | null;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <Label htmlFor="scrap-image">画像</Label>
      {imageData ? (
        <div className="relative inline-block">
          <img
            src={imageData}
            alt="添付画像プレビュー"
            className="max-h-48 rounded-xl border border-cream-dark object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            aria-label="画像を削除"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            ×
          </button>
        </div>
      ) : (
        <input
          id="scrap-image"
          type="file"
          accept="image/*"
          onChange={onFile}
          className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-xl file:border-0 file:bg-cream-mid file:px-3 file:py-2 file:text-sm file:font-medium file:text-navy hover:file:bg-cream-dark"
        />
      )}
    </div>
  );
}

function TagField({
  tags,
  tagInput,
  setTagInput,
  onAdd,
  onRemove,
  onKeyDown,
}: {
  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <Label htmlFor="scrap-tag">タグ</Label>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-cream-mid px-3 py-1 text-sm text-navy"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                aria-label={`タグ「${tag}」を削除`}
                className="text-ink-muted hover:text-ink"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          id="scrap-tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="タグを追加してEnter"
          className={cn(
            "w-full rounded-xl border border-cream-dark px-3 py-2",
            "focus:outline-none focus:ring-2 focus:ring-coral"
          )}
        />
        <Button type="button" variant="secondary" onClick={onAdd} disabled={!tagInput.trim()}>
          追加
        </Button>
      </div>
    </div>
  );
}

export function ScrapForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  resetOnSubmit = false,
}: ScrapFormProps) {
  const form = useScrapForm({ initial, onSubmit, resetOnSubmit });

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="scrap-content">メモ</Label>
        <Textarea
          id="scrap-content"
          value={form.content}
          onChange={(e) => form.setContent(e.target.value)}
          placeholder="思いついたことを何でもメモ..."
          rows={3}
          maxLength={SCRAP_CONTENT_MAX}
        />
      </div>

      <ImageField
        imageData={form.imageData}
        onFile={form.handleFileChange}
        onClear={form.clearImage}
      />

      <TagField
        tags={form.tags}
        tagInput={form.tagInput}
        setTagInput={form.setTagInput}
        onAdd={form.addTag}
        onRemove={form.removeTag}
        onKeyDown={form.handleTagKeyDown}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={!form.canSubmit || form.submitting}>
          {form.submitting ? "保存中..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={form.submitting}>
            キャンセル
          </Button>
        )}
      </div>
    </form>
  );
}
