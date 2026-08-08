import { Button } from "@/components/ui/button";

interface CalendarFooterProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function CalendarFooter({ isSaving, onCancel, onSave }: CalendarFooterProps) {
  return (
    <footer className="flex shrink-0 gap-3 bg-white/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-1px_3px_rgba(0,0,0,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <Button variant="secondary" className="flex-1" onClick={onCancel}>
        キャンセル
      </Button>
      <Button className="flex-1" onClick={onSave} disabled={isSaving}>
        {isSaving ? "保存中..." : "確定して保存"}
      </Button>
    </footer>
  );
}
