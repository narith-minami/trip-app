/**
 * src/features/schedule/components/ScheduleToolbar.tsx
 *
 * Floating action controls for the schedule tab: a primary FAB to add an
 * item, and a secondary FAB that opens a menu for the less-frequent actions
 * (view full itinerary, calendar edit, copy day). Fixed to the bottom-right
 * of the viewport so it stays reachable regardless of scroll position.
 */

import { useNavigate } from "@tanstack/react-router";
import { Calendar, Copy, ListTree, MoreHorizontal, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface ScheduleToolbarProps {
  tripId: string;
  selectedDate: string;
  canEdit: boolean;
  datesLength: number;
  hasItems: boolean;
  onCopy: () => void;
  onAdd: () => void;
}

interface MenuItemProps {
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function MenuItem({ icon: Icon, label, onClick, disabled = false }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-cream-mid disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon size={16} aria-hidden={true} />
      {label}
    </button>
  );
}

function useCloseOnOutsideOrEscape(
  open: boolean,
  close: () => void,
  containerRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close, containerRef]);
}

interface ScheduleMenuProps {
  tripId: string;
  selectedDate: string;
  canEdit: boolean;
  datesLength: number;
  hasItems: boolean;
  onCopy: () => void;
  onNavigate: () => void;
}

function ScheduleMenu({
  tripId,
  selectedDate,
  canEdit,
  datesLength,
  hasItems,
  onCopy,
  onNavigate,
}: ScheduleMenuProps) {
  const navigate = useNavigate();
  return (
    <div
      role="menu"
      aria-label="日程メニュー"
      className={cn(
        "flex w-56 flex-col overflow-hidden rounded-2xl bg-white py-1 shadow-lg",
        "motion-safe:animate-[dialog-panel-in_var(--duration-base)_var(--ease-spring)]"
      )}
    >
      <MenuItem
        icon={ListTree}
        label="全日程を表示する"
        onClick={() => {
          onNavigate();
          navigate({ to: "/trips/$tripId/itinerary", params: { tripId } });
        }}
      />
      {canEdit && (
        <>
          <MenuItem
            icon={Calendar}
            label="カレンダー編集"
            onClick={() => {
              onNavigate();
              navigate({
                to: "/trips/$tripId/schedule-edit",
                params: { tripId },
                search: { date: selectedDate },
              });
            }}
          />
          <MenuItem
            icon={Copy}
            label="コピー"
            onClick={() => {
              onNavigate();
              onCopy();
            }}
            disabled={datesLength <= 1 || !hasItems}
          />
        </>
      )}
    </div>
  );
}

export function ScheduleToolbar({
  tripId,
  selectedDate,
  canEdit,
  datesLength,
  hasItems,
  onCopy,
  onAdd,
}: ScheduleToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setMenuOpen(false);
  useCloseOnOutsideOrEscape(menuOpen, close, containerRef);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3"
    >
      {menuOpen && (
        <ScheduleMenu
          tripId={tripId}
          selectedDate={selectedDate}
          canEdit={canEdit}
          datesLength={datesLength}
          hasItems={hasItems}
          onCopy={onCopy}
          onNavigate={close}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "メニューを閉じる" : "その他の操作"}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-md",
            "transition-transform duration-[var(--duration-fast)] active:scale-95 motion-reduce:transform-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          )}
        >
          {menuOpen ? (
            <X size={20} aria-hidden={true} />
          ) : (
            <MoreHorizontal size={20} aria-hidden={true} />
          )}
        </button>
        {canEdit && (
          <button
            type="button"
            onClick={onAdd}
            aria-label="アイテムを追加"
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-coral text-white shadow-lg",
              "transition-transform duration-[var(--duration-fast)] active:scale-95 motion-reduce:transform-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            )}
          >
            <Plus size={26} aria-hidden={true} />
          </button>
        )}
      </div>
    </div>
  );
}
