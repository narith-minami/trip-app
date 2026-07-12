/**
 * src/features/scraps/hooks/useScrapForm.ts
 *
 * State and handlers for the scrap create/edit form (body, image, tags).
 * Extracted from ScrapForm to keep the component focused on rendering.
 */

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { useTagInput } from "@/features/scraps/hooks/useTagInput";
import { SCRAP_IMAGE_MAX_BYTES } from "@/lib/schemas/scrap";

export interface ScrapFormData {
  content: string | null;
  imageData: string | null;
  tags: string[];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

interface Options {
  initial?: Partial<ScrapFormData>;
  onSubmit: (data: ScrapFormData) => Promise<void>;
  resetOnSubmit: boolean;
}

export function useScrapForm({ initial, onSubmit, resetOnSubmit }: Options) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [imageData, setImageData] = useState<string | null>(initial?.imageData ?? null);
  const [submitting, setSubmitting] = useState(false);
  const tagState = useTagInput(initial?.tags ?? []);

  const canSubmit = content.trim().length > 0 || !!imageData;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }
    if (file.size > SCRAP_IMAGE_MAX_BYTES) {
      toast.error("画像サイズは1MB以下にしてください");
      return;
    }
    try {
      setImageData(await readFileAsDataUrl(file));
    } catch {
      toast.error("画像の読み込みに失敗しました");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        content: content.trim().length > 0 ? content : null,
        imageData,
        tags: tagState.tags,
      });
      if (resetOnSubmit) {
        setContent("");
        setImageData(null);
        tagState.resetTags();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    content,
    setContent,
    imageData,
    clearImage: () => setImageData(null),
    tags: tagState.tags,
    tagInput: tagState.tagInput,
    setTagInput: tagState.setTagInput,
    submitting,
    canSubmit,
    addTag: tagState.addTag,
    removeTag: tagState.removeTag,
    handleTagKeyDown: tagState.handleTagKeyDown,
    handleFileChange,
    handleSubmit,
  };
}
