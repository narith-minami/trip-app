/**
 * src/features/trips/components/TripHeader.tsx
 *
 * Hero header for the trip detail page.
 * Gradient background with countdown badge, title, date range and member avatars.
 */

import { ChevronLeft, MoreVertical, Palette, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MenuItem, MenuPanel, useCloseOnOutsideOrEscape } from "@/components/ui/menu";
import { TripColorSettings } from "@/features/trips/components/TripColorSettings";
import type { TripColors } from "@/features/trips/hooks/useTripColors";
import type { useTripEditor } from "@/features/trips/hooks/useTripEditor";
import { cn } from "@/lib/cn";
import type { TripMember } from "@/types/entities";

type TripEditor = ReturnType<typeof useTripEditor>;

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
  title: string;
  destination?: string | null;
  startDate: string;
  endDate: string;
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

function TripEditFields({ editor }: { editor: TripEditor }) {
  const { editData, setField } = editor;
  return (
    <div className="mt-4 space-y-3">
      <div>
        <Label className="text-cream-mid">場所</Label>
        <Input
          value={editData.location}
          onChange={(e) => setField("location", e.target.value)}
          placeholder="場所"
          className="border-cream-dark/40 bg-navy-mid text-white placeholder:text-ink-light focus:ring-coral"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-cream-mid">出発日</Label>
          <Input
            type="date"
            value={editData.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
            className="border-cream-dark/40 bg-navy-mid text-white focus:ring-coral"
          />
        </div>
        <div>
          <Label className="text-cream-mid">帰着日</Label>
          <Input
            type="date"
            value={editData.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
            className="border-cream-dark/40 bg-navy-mid text-white focus:ring-coral"
          />
        </div>
      </div>
    </div>
  );
}

function OwnerActionsMenu({ editor, onEdit }: { editor: TripEditor; onEdit: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setMenuOpen(false);
  useCloseOnOutsideOrEscape(menuOpen, close, containerRef);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="旅行の操作"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      >
        <MoreVertical size={20} aria-hidden={true} />
      </button>
      {menuOpen && (
        <MenuPanel aria-label="旅行の操作メニュー" className="absolute right-0 top-full z-40 mt-2">
          <MenuItem
            icon={Pencil}
            label="編集"
            onClick={() => {
              close();
              onEdit();
            }}
          />
          <MenuItem
            icon={Trash2}
            label="削除"
            danger
            disabled={editor.isDeleting}
            onClick={() => {
              close();
              editor.remove();
            }}
          />
        </MenuPanel>
      )}
    </div>
  );
}

function OwnerActions({ editor, onEdit }: { editor: TripEditor; onEdit: () => void }) {
  if (editor.isEditing) {
    return (
      <>
        <Button variant="success" onClick={editor.save} disabled={editor.isSaving}>
          保存
        </Button>
        <Button
          variant="secondary"
          onClick={editor.cancelEdit}
          className="border-white/20 text-white hover:bg-white/10"
        >
          キャンセル
        </Button>
      </>
    );
  }
  return <OwnerActionsMenu editor={editor} onEdit={onEdit} />;
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
}: {
  isOwner: boolean;
  editor: TripEditor;
  onEdit: () => void;
  onBack: () => void;
  onOpenColorSettings?: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-white/80 hover:bg-white/10 hover:text-white"
      >
        <span className="inline-flex items-center gap-1">
          <ChevronLeft size={16} aria-hidden="true" />
          戻る
        </span>
      </Button>
      <div className="flex gap-2">
        {onOpenColorSettings && !editor.isEditing && (
          <Button
            variant="ghost"
            onClick={onOpenColorSettings}
            aria-label="配色をカスタマイズ"
            className="text-white/80 hover:bg-white/10 hover:text-white"
          >
            <span className="inline-flex items-center gap-1">
              <Palette size={16} aria-hidden="true" />
              配色
            </span>
          </Button>
        )}
        {isOwner && <OwnerActions editor={editor} onEdit={onEdit} />}
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
            className="mb-2 w-full border-b-2 border-coral bg-transparent font-display text-3xl font-bold text-white focus:outline-none"
            aria-label="Trip title"
          />
        ) : (
          <h1 className="mb-2 font-display text-3xl font-bold text-white">{trip.title}</h1>
        )}
        <div className="flex items-end justify-between gap-4">
          <p className="text-sm text-cream-mid">
            {formatJaDate(trip.startDate)} — {formatJaDate(trip.endDate)}
          </p>
          {members && members.length > 0 && <MemberStack members={members} />}
        </div>
        {editor.isEditing && <TripEditFields editor={editor} />}
      </div>
    </div>
  );
}
