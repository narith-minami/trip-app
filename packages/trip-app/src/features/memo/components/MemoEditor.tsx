/**
 * src/features/memo/components/MemoEditor.tsx
 *
 * Editable shared memo with dirty tracking and a save action.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export interface MemoEditorProps {
  content: string;
  isSaving?: boolean;
  onSave: (content: string) => void;
}

export function MemoEditor({ content, isSaving = false, onSave }: MemoEditorProps) {
  // Editable draft seeded from the persisted content. Deriving the initial
  // value from a prop is the expected pattern for an editable field.
  // react-doctor-disable-next-line react-doctor/no-derived-useState -- editable draft must seed its initial value from the content prop
  const [value, setValue] = useState(content);
  // `baseline` is the persisted content this draft was last synced to. It is
  // read during render (the comparison below) to drive the sync — this is
  // React's "store info from previous render" pattern.
  // react-doctor-disable-next-line react-doctor/no-derived-useState, react-doctor/rerender-state-only-in-handlers -- tracks last-synced content to drive the render-time sync, per the React docs pattern
  const [baseline, setBaseline] = useState(content);

  // Adjust state during render instead of in an effect (the recommended React
  // pattern). When the persisted content changes upstream — e.g. a background
  // refetch — adopt it, but only if the user hasn't made unsaved edits, so we
  // never overwrite active typing.
  if (content !== baseline) {
    setBaseline(content);
    if (value === baseline) {
      setValue(content);
    }
  }

  const dirty = value !== content;

  return (
    <div className="space-y-3">
      <Textarea
        rows={12}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="旅行の共有メモ..."
        className="font-mono text-sm"
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {dirty ? "未保存の変更があります" : "すべての変更が保存されました"}
        </p>
        <Button onClick={() => onSave(value)} disabled={!dirty || isSaving}>
          {isSaving ? "保存中..." : "メモを保存"}
        </Button>
      </div>
    </div>
  );
}
