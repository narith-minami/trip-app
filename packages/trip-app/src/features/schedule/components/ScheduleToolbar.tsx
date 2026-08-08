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
import { useRef, useState } from "react";
import { MenuItem, MenuPanel, useCloseOnOutsideOrEscape } from "@/components/ui/menu";
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
    <MenuPanel aria-label="日程メニュー">
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
    </MenuPanel>
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
  useCloseOnOutsideOrEscape(menuOpen, close, [containerRef]);

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
