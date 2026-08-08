/**
 * src/features/schedule/components/ScheduleItemCardImages.tsx
 *
 * Photo gallery (thumbnails, add tile, lightbox) for a schedule item card,
 * split out of ScheduleItemCard.tsx to keep that file under the max-lines limit.
 */

import { Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ScheduleItem, ScheduleItemImage } from "@/types/entities";

/** Full-screen enlarged view of a single tapped photo. No prev/next navigation. */
function ImageLightbox({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="拡大表示を閉じる"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <img src={imageUrl} alt="" className="max-h-[85dvh] max-w-full rounded-lg object-contain" />
    </button>
  );
}

interface ImageThumbnailProps {
  image: ScheduleItemImage;
  canEdit: boolean;
  isDeleting: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

function ImageThumbnail({ image, canEdit, isDeleting, onOpen, onDelete }: ImageThumbnailProps) {
  return (
    <div className="relative h-20 w-20 shrink-0">
      <button
        type="button"
        onClick={onOpen}
        className="h-full w-full overflow-hidden rounded-lg"
        aria-label="写真を拡大表示"
      >
        <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
      </button>
      {canEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          aria-label="写真を削除"
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-50"
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

interface AddImageTileProps {
  isUploading: boolean;
  onSelectFile: (file: File) => void;
}

function AddImageTile({ isUploading, onSelectFile }: AddImageTileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onSelectFile(file);
  };

  return (
    <div className="h-20 w-20 shrink-0">
      <label htmlFor={inputId} className="sr-only">
        写真を追加
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-cream-dark text-ink-light hover:border-ink-muted hover:text-ink-muted disabled:opacity-50"
      >
        {isUploading ? (
          <span className="text-lg leading-none">…</span>
        ) : (
          <Plus size={18} aria-hidden="true" />
        )}
        <span className="text-[10px] leading-none">{isUploading ? "追加中" : "写真を追加"}</span>
      </button>
    </div>
  );
}

export interface CardImagesProps {
  item: ScheduleItem;
  canEdit: boolean;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
}

export function CardImages({ item, canEdit, onUploadImage, onDeleteImage }: CardImagesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<ScheduleItemImage | null>(null);

  if (item.images.length === 0 && !canEdit) return null;

  const handleSelectFile = async (file: File) => {
    if (!onUploadImage) return;
    setIsUploading(true);
    await onUploadImage(item.id, file);
    setIsUploading(false);
  };

  const handleDelete = async (imageId: string) => {
    if (!onDeleteImage) return;
    setDeletingIds((prev) => new Set(prev).add(imageId));
    await onDeleteImage(item.id, imageId);
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {item.images.map((image) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            canEdit={canEdit}
            isDeleting={deletingIds.has(image.id)}
            onOpen={() => setLightboxImage(image)}
            onDelete={() => handleDelete(image.id)}
          />
        ))}
        {canEdit && <AddImageTile isUploading={isUploading} onSelectFile={handleSelectFile} />}
      </div>
      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage.imageUrl} onClose={() => setLightboxImage(null)} />
      )}
    </>
  );
}
