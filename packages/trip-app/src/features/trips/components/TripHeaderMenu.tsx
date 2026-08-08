/**
 * src/features/trips/components/TripHeaderMenu.tsx
 *
 * Trip header's top-bar action controls: while editing, direct save/cancel
 * buttons; otherwise a single "..." trigger with a dropdown menu for the
 * low-frequency actions (color customization, edit, delete).
 */

import { MoreVertical, Palette, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  MenuItem,
  MenuPanel,
  useCloseOnOutsideOrEscape,
  useMenuPosition,
} from "@/components/ui/menu";
import type { useTripEditor } from "@/features/trips/hooks/useTripEditor";
import { cn } from "@/lib/cn";

type TripEditor = ReturnType<typeof useTripEditor>;

export function EditingActions({ editor }: { editor: TripEditor }) {
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

function MenuTriggerButton({
  triggerRef,
  menuOpen,
  onToggle,
  iconToneClassName,
}: {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuOpen: boolean;
  onToggle: () => void;
  iconToneClassName?: string;
}) {
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onToggle}
      aria-label="旅行の操作"
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
        iconToneClassName ?? "text-white/80 hover:bg-white/10 hover:text-white"
      )}
    >
      <MoreVertical size={20} aria-hidden={true} />
    </button>
  );
}

function TripActionMenuItems({
  isOwner,
  editor,
  onEdit,
  onOpenColorSettings,
  close,
}: {
  isOwner: boolean;
  editor: TripEditor;
  onEdit: () => void;
  onOpenColorSettings?: () => void;
  close: () => void;
}) {
  return (
    <>
      {onOpenColorSettings && (
        <MenuItem
          icon={Palette}
          label="配色"
          onClick={() => {
            close();
            onOpenColorSettings();
          }}
        />
      )}
      {isOwner && (
        <>
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
        </>
      )}
    </>
  );
}

export function TripHeaderMenu({
  isOwner,
  editor,
  onEdit,
  onOpenColorSettings,
  iconToneClassName,
}: {
  isOwner: boolean;
  editor: TripEditor;
  onEdit: () => void;
  onOpenColorSettings?: () => void;
  /** Tone-matched hover/text classes so the icon stays legible against the header background. */
  iconToneClassName?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = () => setMenuOpen(false);
  const position = useMenuPosition(menuOpen, triggerRef);
  useCloseOnOutsideOrEscape(menuOpen, close, [triggerRef, menuRef]);

  if (!onOpenColorSettings && !isOwner) return null;

  return (
    <>
      <MenuTriggerButton
        triggerRef={triggerRef}
        menuOpen={menuOpen}
        onToggle={() => setMenuOpen((prev) => !prev)}
        iconToneClassName={iconToneClassName}
      />
      {menuOpen &&
        position &&
        createPortal(
          <MenuPanel
            ref={menuRef}
            aria-label="旅行の操作メニュー"
            className="fixed z-50"
            style={{ top: position.top, right: position.right }}
          >
            <TripActionMenuItems
              isOwner={isOwner}
              editor={editor}
              onEdit={onEdit}
              onOpenColorSettings={onOpenColorSettings}
              close={close}
            />
          </MenuPanel>,
          document.body
        )}
    </>
  );
}
