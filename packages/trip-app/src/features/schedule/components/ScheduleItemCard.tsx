/**
 * src/features/schedule/components/ScheduleItemCard.tsx
 *
 * Card-only display for a single schedule item.
 * Layout (thumbnail + connecting line) is handled by ScheduleTimeline.
 */

import { MapPin, Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { resolveEventType } from "@/lib/eventTypes";
import type { ScheduleItem, ScheduleItemImage } from "@/types/entities";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (mins > 0) return `${mins}分前`;
  return "たった今";
}

export interface ScheduleItemCardProps {
  item: ScheduleItem;
  canEdit?: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (item: ScheduleItem) => void;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
}

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

interface CardImagesProps {
  item: ScheduleItem;
  canEdit: boolean;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
}

function CardImages({ item, canEdit, onUploadImage, onDeleteImage }: CardImagesProps) {
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

function CardFooter({ item }: { item: ScheduleItem }) {
  return (
    <div className="flex items-center justify-between border-t border-cream-dark px-4 py-2">
      <span className="text-xs text-ink-light">
        {item.updatedBy ? `${item.updatedBy} · ` : ""}
        {timeAgo(item.updatedAt)}
      </span>
      {item.placeUrl && (
        <a
          href={item.placeUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-coral"
        >
          マップ
        </a>
      )}
    </div>
  );
}

export function ScheduleItemCard({
  item,
  canEdit = false,
  onEdit,
  onDelete,
  onUploadImage,
  onDeleteImage,
}: ScheduleItemCardProps) {
  const eventType = resolveEventType(item.eventType);
  const Icon = eventType.icon;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        item.isTentative === 1 ? "border-dashed border-ink-light opacity-60" : "border-cream-dark"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${eventType.color}20`, color: eventType.color }}
              >
                <Icon size={11} />
              </span>
              <span className="text-xs font-medium" style={{ color: eventType.color }}>
                {eventType.label}
              </span>
              {item.isTentative === 1 && (
                <Badge
                  variant="custom"
                  className="border border-dashed border-ink-light bg-cream text-ink-muted"
                >
                  仮予定
                </Badge>
              )}
            </div>
            <h4 className="mt-1 font-semibold text-ink">{item.title}</h4>
            {item.placeName && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-muted">
                <MapPin size={12} aria-hidden="true" />
                {item.placeName}
              </p>
            )}
          </div>
          {canEdit && (
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit?.(item)}>
                編集
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete?.(item)}>
                削除
              </Button>
            </div>
          )}
        </div>
        {item.memo && (
          <div className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm text-ink-muted">
            {item.memo}
          </div>
        )}
        <CardImages
          item={item}
          canEdit={canEdit}
          onUploadImage={onUploadImage}
          onDeleteImage={onDeleteImage}
        />
      </div>
      <CardFooter item={item} />
    </div>
  );
}
