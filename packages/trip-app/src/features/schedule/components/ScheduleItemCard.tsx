/**
 * src/features/schedule/components/ScheduleItemCard.tsx
 *
 * Card-only display for a single schedule item.
 * Layout (thumbnail + connecting line) is handled by ScheduleTimeline.
 */

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveEventType } from "@/lib/eventTypes";
import type { ScheduleItem } from "@/types/entities";

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
  onDeleteImage?: (itemId: string) => Promise<void>;
}

interface CardImageProps {
  item: ScheduleItem;
  canEdit: boolean;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string) => Promise<void>;
}

function CardImage({ item, canEdit, onUploadImage, onDeleteImage }: CardImageProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!canEdit && !item.imageUrl) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadImage) return;
    setIsUploading(true);
    await onUploadImage(item.id, file);
    setIsUploading(false);
  };

  const handleDelete = async () => {
    if (!onDeleteImage) return;
    setIsDeleting(true);
    await onDeleteImage(item.id);
    setIsDeleting(false);
  };

  if (item.imageUrl) {
    return (
      <div className="relative mt-2">
        <img src={item.imageUrl} alt={item.title} className="h-32 w-full rounded-xl object-cover" />
        {canEdit && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute right-2 top-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "削除中..." : "写真を削除"}
          </Button>
        )}
      </div>
    );
  }

  if (!canEdit) return null;

  return (
    <div className="mt-2">
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
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? "アップロード中..." : "📷 写真を追加"}
      </Button>
    </div>
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
    <div className="overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${eventType.color}20`, color: eventType.color }}
              >
                <Icon size={11} />
              </span>
              <span className="text-xs font-medium" style={{ color: eventType.color }}>
                {eventType.label}
              </span>
            </div>
            <h4 className="mt-1 font-semibold text-ink">{item.title}</h4>
            {item.placeName && <p className="mt-0.5 text-sm text-ink-muted">📍 {item.placeName}</p>}
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
        <CardImage
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
