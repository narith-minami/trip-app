/**
 * src/features/trips/components/TripHeader.tsx
 *
 * Hero header for the trip detail page.
 * Gradient background with countdown badge, title, date range and member avatars.
 */

import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TripColorSettings } from "@/features/trips/components/TripColorSettings";
import { TripEditFields } from "@/features/trips/components/TripEditFields";
import { EditingActions, TripHeaderMenu } from "@/features/trips/components/TripHeaderMenu";
import type { TripColors } from "@/features/trips/hooks/useTripColors";
import type { useTripEditor } from "@/features/trips/hooks/useTripEditor";
import { cn } from "@/lib/cn";
import { getContrastTone } from "@/lib/colorContrast";
import type { TripMember } from "@/types/entities";

type TripEditor = ReturnType<typeof useTripEditor>;

// Not routed through src/lib/japaneseDate.ts (unlike the other 4 DOW/date-parse
// call sites) — this file already sits at the import/max-dependencies limit
// (10 external modules), and it composes enough distinct responsibilities
// (header tone, countdown, editing coordination) that it isn't a clean fit for
// the "構成ルートファイル" lint exemption the way ScheduleSection.tsx is.
const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatJaDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日(${DOW[d.getDay()]})`;
}

function daysUntilDeparture(startDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((parseLocalDate(startDate).getTime() - today.getTime()) / 86400000);
}

export interface TripHeaderTrip {
  id: string;
  title: string;
  destination?: string | null;
  startDate: string;
  endDate: string;
  coverImageUrl?: string | null;
}

export interface TripHeaderProps {
  trip: TripHeaderTrip;
  isOwner: boolean;
  editor: TripEditor;
  members?: TripMember[];
  onBack: () => void;
  /** User-chosen header color. When null/undefined the default gradient is used. */
  headerColor?: string | null;
  /**
   * Enables the color customization UI (🎨 button + dialog). When omitted the
   * customizer is hidden. The dialog edits both the page background and the
   * header color; `backgroundColor` reflects the current saved page background.
   */
  colorControls?: {
    backgroundColor: string | null;
    onSave: (partial: Partial<TripColors>) => void;
    onReset: () => void;
  };
}

const DEFAULT_HEADER_BACKGROUND = "linear-gradient(160deg, #5B8A6F 0%, #243D5C 55%, #0F1C2E 100%)";
/** Representative color used for contrast calculation when no custom header color is set. */
const DEFAULT_HEADER_ANCHOR = "#243D5C";

interface HeaderToneClasses {
  text: string;
  textMuted: string;
  icon: string;
}

function getHeaderToneClasses(headerColor: string | null | undefined): HeaderToneClasses {
  const tone = getContrastTone(headerColor ?? DEFAULT_HEADER_ANCHOR);
  if (tone === "dark") {
    return {
      text: "text-ink",
      textMuted: "text-ink-light",
      icon: "text-ink/70 hover:bg-ink/10 hover:text-ink",
    };
  }
  return {
    text: "text-white",
    textMuted: "text-cream-mid",
    icon: "text-white/80 hover:bg-white/10 hover:text-white",
  };
}

function MemberStack({ members }: { members: TripMember[] }) {
  const visible = members.slice(0, 3);
  const extra = members.length - 3;
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <Avatar
          key={m.userId}
          name={m.user?.name ?? m.userId}
          image={m.user?.image}
          className={cn("h-8 w-8 text-xs ring-2 ring-white/20", i > 0 && "-ml-2")}
        />
      ))}
      {extra > 0 && (
        <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-navy-mid text-xs font-semibold text-white ring-2 ring-white/20">
          +{extra}
        </span>
      )}
    </div>
  );
}

function TripHeaderBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      aria-hidden="true"
    />
  );
}

function TripHeaderTopBar({
  isOwner,
  editor,
  onEdit,
  onBack,
  onOpenColorSettings,
  tone,
}: {
  isOwner: boolean;
  editor: TripEditor;
  onEdit: () => void;
  onBack: () => void;
  onOpenColorSettings?: () => void;
  tone: HeaderToneClasses;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <Button variant="ghost" onClick={onBack} className={tone.icon}>
        <span className="inline-flex items-center gap-1">
          <ChevronLeft size={16} aria-hidden="true" />
          戻る
        </span>
      </Button>
      <div className="flex items-center gap-2">
        {editor.isEditing ? (
          <EditingActions editor={editor} />
        ) : (
          <TripHeaderMenu
            isOwner={isOwner}
            editor={editor}
            onEdit={onEdit}
            onOpenColorSettings={onOpenColorSettings}
            iconToneClassName={tone.icon}
          />
        )}
      </div>
    </div>
  );
}

export function TripHeader({
  trip,
  isOwner,
  editor,
  members,
  onBack,
  headerColor,
  colorControls,
}: TripHeaderProps) {
  const [colorDialogOpen, setColorDialogOpen] = useState(false);

  const handleEdit = () =>
    editor.startEdit({
      title: trip.title,
      location: trip.destination ?? "",
      startDate: trip.startDate,
      endDate: trip.endDate,
    });

  const days = daysUntilDeparture(trip.startDate);
  const tone = getHeaderToneClasses(headerColor);

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: headerColor ?? DEFAULT_HEADER_BACKGROUND }}
    >
      {colorControls && (
        <TripColorSettings
          open={colorDialogOpen}
          onClose={() => setColorDialogOpen(false)}
          backgroundColor={colorControls.backgroundColor}
          headerColor={headerColor ?? null}
          onSave={colorControls.onSave}
          onReset={colorControls.onReset}
        />
      )}
      <TripHeaderBackground />
      <div className="relative mx-auto max-w-4xl px-4 pb-6 pt-4">
        <TripHeaderTopBar
          isOwner={isOwner}
          editor={editor}
          onEdit={handleEdit}
          onBack={onBack}
          onOpenColorSettings={colorControls ? () => setColorDialogOpen(true) : undefined}
          tone={tone}
        />
        {days > 0 && (
          <Badge variant="custom" className="mb-3 bg-coral !px-3 !py-1 text-white !font-semibold">
            {days}日後出発
          </Badge>
        )}
        {editor.isEditing ? (
          <input
            type="text"
            value={editor.editData.title}
            onChange={(e) => editor.setField("title", e.target.value)}
            className={cn(
              "mb-2 w-full border-b-2 border-coral bg-transparent font-display text-3xl font-bold focus:outline-none",
              tone.text
            )}
            aria-label="Trip title"
          />
        ) : (
          <h1 className={cn("mb-2 font-display text-3xl font-bold", tone.text)}>{trip.title}</h1>
        )}
        <div className="flex items-end justify-between gap-4">
          <p className={cn("text-sm", tone.textMuted)}>
            {formatJaDate(trip.startDate)} — {formatJaDate(trip.endDate)}
          </p>
          {members && members.length > 0 && <MemberStack members={members} />}
        </div>
        {editor.isEditing && (
          <TripEditFields editor={editor} tripId={trip.id} coverImageUrl={trip.coverImageUrl} />
        )}
      </div>
    </div>
  );
}
