/**
 * src/features/schedule/components/ScheduleItemCardImages.tsx
 *
 * Photo gallery (thumbnails, lightbox) for a schedule item card, split out
 * of ScheduleItemCard.tsx to keep that file under the max-lines limit. The
 * "add photo" trigger itself lives in the card header (see AddPhotoButton
 * in ScheduleItemCard.tsx).
 */

import { X } from "lucide-react";
import { useState } from "react";
import { useEscapeKey } from "@/components/ui/dialog";
import { resolveImageSrc } from "@/lib/imageSrc";
import type { ScheduleItem, ScheduleItemImage } from "@/types/entities";

/** Full-screen enlarged view of a single tapped photo. No prev/next navigation. */
function ImageLightbox({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  useEscapeKey(true, onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") onClose();
      }}
      role="presentation"
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="拡大表示"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="" className="max-h-[85dvh] max-w-full rounded-lg object-contain" />
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="拡大表示を閉じる"
        className="absolute right-4 top-4 text-white/80 hover:text-white"
      >
        <X size={24} aria-hidden="true" />
      </button>
    </div>
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
        <img src={resolveImageSrc(image.imageUrl)} alt="" className="h-full w-full object-cover" />
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

export interface CardImagesProps {
  item: ScheduleItem;
  canEdit: boolean;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
}

export function CardImages({ item, canEdit, onDeleteImage }: CardImagesProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<ScheduleItemImage | null>(null);

  if (item.images.length === 0) return null;

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
      </div>
      {lightboxImage && (
        <ImageLightbox
          imageUrl={resolveImageSrc(lightboxImage.imageUrl)}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
