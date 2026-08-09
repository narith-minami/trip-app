/**
 * src/features/schedule/components/ScheduleItemCard.tsx
 *
 * Card-only display for a single schedule item.
 * Layout (thumbnail + connecting line) is handled by ScheduleTimeline.
 */

import { useNavigate } from "@tanstack/react-router";
import { Building2, ImagePlus, MapPin, Pencil } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { resolveEventType } from "@/lib/eventTypes";
import { resolveFacilityType } from "@/lib/facilityTypes";
import { DAY_MS } from "@/lib/japaneseDate";
import type { ScheduleItem } from "@/types/entities";
import { CardImages } from "./ScheduleItemCardImages";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (mins > 0) return `${mins}分前`;
  return "たった今";
}

export interface ScheduleItemCardProps {
  tripId: string;
  item: ScheduleItem;
  canEdit?: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
  onDeleteImage?: (itemId: string, imageId: string) => Promise<void>;
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

function FacilityLink({ tripId, item }: { tripId: string; item: ScheduleItem }) {
  const navigate = useNavigate();
  const facility = item.facility;
  if (!facility) return null;
  const facilityType = resolveFacilityType(facility.category);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigate({
          to: "/trips/$tripId/facilities/$facilityId",
          params: { tripId, facilityId: facility.id },
        });
      }}
      className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${facilityType.color}20`, color: facilityType.color }}
    >
      <Building2 size={12} aria-hidden="true" />
      {facility.name}
    </button>
  );
}

interface AddPhotoButtonProps {
  itemId: string;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
}

/** Icon-only photo upload trigger shown in the card header, left of the edit icon. */
function AddPhotoButton({ itemId, onUploadImage }: AddPhotoButtonProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadImage) return;
    setIsUploading(true);
    try {
      await onUploadImage(itemId, file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
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
        disabled={isUploading || !onUploadImage}
      />
      <Button
        size="sm"
        variant="ghost"
        className="px-2"
        aria-label="写真を追加"
        disabled={isUploading || !onUploadImage}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={16} aria-hidden="true" />
      </Button>
    </>
  );
}

interface CardHeaderProps {
  tripId: string;
  item: ScheduleItem;
  canEdit: boolean;
  onEdit?: (item: ScheduleItem) => void;
  onUploadImage?: (itemId: string, file: File) => Promise<void>;
}

function CardHeader({ tripId, item, canEdit, onEdit, onUploadImage }: CardHeaderProps) {
  const eventType = resolveEventType(item.eventType);
  const Icon = eventType.icon;

  return (
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
        <FacilityLink tripId={tripId} item={item} />
      </div>
      {canEdit && (
        <div className="flex shrink-0 items-center gap-1">
          <AddPhotoButton itemId={item.id} onUploadImage={onUploadImage} />
          <Button
            size="sm"
            variant="ghost"
            className="px-2"
            aria-label="編集"
            disabled={!onEdit}
            onClick={() => onEdit?.(item)}
          >
            <Pencil size={16} aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ScheduleItemCard({
  tripId,
  item,
  canEdit = false,
  onEdit,
  onUploadImage,
  onDeleteImage,
}: ScheduleItemCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        item.isTentative === 1 ? "border-dashed border-ink-light opacity-60" : "border-cream-dark"
      )}
    >
      <div className="p-4">
        <CardHeader
          tripId={tripId}
          item={item}
          canEdit={canEdit}
          onEdit={onEdit}
          onUploadImage={onUploadImage}
        />
        {item.memo && (
          <div className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm text-ink-muted">
            {item.memo}
          </div>
        )}
        <CardImages item={item} canEdit={canEdit} onDeleteImage={onDeleteImage} />
      </div>
      <CardFooter item={item} />
    </div>
  );
}
