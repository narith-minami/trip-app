/**
 * src/features/trips/components/TripCoverField.tsx
 *
 * Trip edit field for the list-card thumbnail: upload an image to R2, or
 * set a direct image URL. Each action persists immediately (like
 * TripColorSettings), independent of the surrounding edit draft's "保存".
 */

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useUpdateTrip, useUploadTripCover } from "@/features/trips/hooks/useTripMutations";
import { isValidCoverImageFile, resolveCoverImageSrc } from "@/features/trips/lib/coverImage";

export function TripCoverField({
  tripId,
  coverImageUrl,
}: {
  tripId: string;
  coverImageUrl?: string | null;
}) {
  const uploadCover = useUploadTripCover(tripId);
  const updateTrip = useUpdateTrip(tripId);
  const [urlDraft, setUrlDraft] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isValidCoverImageFile(file)) {
      toast.error("画像ファイル(5MB以内)を選択してください");
      return;
    }
    uploadCover.mutate(file, {
      onSuccess: () => toast.success("サムネイル画像を更新しました"),
      onError: () => toast.error("サムネイル画像のアップロードに失敗しました"),
    });
  };

  const handleUrlSave = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    updateTrip.mutate(
      { coverImageUrl: trimmed },
      {
        onSuccess: () => {
          toast.success("サムネイル画像を更新しました");
          setUrlDraft("");
        },
        onError: () => toast.error("サムネイル画像の設定に失敗しました"),
      }
    );
  };

  return (
    <div>
      <Label className="text-cream-mid">サムネイル画像</Label>
      <div className="flex items-center gap-3">
        {coverImageUrl && (
          <img
            src={resolveCoverImageSrc(coverImageUrl)}
            alt=""
            className="h-12 w-20 rounded-lg object-cover"
          />
        )}
        <label className="cursor-pointer whitespace-nowrap rounded-lg border border-cream-dark/40 bg-navy-mid px-3 py-1.5 text-xs text-white hover:bg-navy-mid/80">
          画像をアップロード
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadCover.isPending}
          />
        </label>
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="画像URLを入力(https://...)"
          className="border-cream-dark/40 bg-navy-mid text-white placeholder:text-ink-light focus:ring-coral"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleUrlSave}
          disabled={updateTrip.isPending || !urlDraft.trim()}
        >
          設定
        </Button>
      </div>
      <p className="mt-1 text-xs text-ink-light">推奨: 16:9、5MB以内</p>
    </div>
  );
}
