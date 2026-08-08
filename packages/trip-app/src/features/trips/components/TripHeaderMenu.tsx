/**
 * src/features/trips/components/TripHeaderMenu.tsx
 *
 * Trip header's top-bar action controls: while editing, direct save/cancel
 * buttons; otherwise a single "..." trigger with a dropdown menu for the
 * low-frequency actions (color customization, edit, delete).
 */

import { MoreVertical, Palette, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuItem, MenuPanel, useCloseOnOutsideOrEscape } from "@/components/ui/menu";
import type { useTripEditor } from "@/features/trips/hooks/useTripEditor";

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

export function TripHeaderMenu({
  isOwner,
  editor,
  onEdit,
  onOpenColorSettings,
}: {
  isOwner: boolean;
  editor: TripEditor;
  onEdit: () => void;
  onOpenColorSettings?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setMenuOpen(false);
  useCloseOnOutsideOrEscape(menuOpen, close, containerRef);

  if (!onOpenColorSettings && !isOwner) return null;

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
        </MenuPanel>
      )}
    </div>
  );
}
