/**
 * src/features/memo/components/MemoEditor.tsx
 *
 * Editable shared memo with dirty tracking and a save action.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export interface MemoEditorProps {
  content: string;
  isSaving?: boolean;
  onSave: (content: string) => void;
}

export function MemoEditor({ content, isSaving = false, onSave }: MemoEditorProps) {
  const [value, setValue] = useState(content);

  // Keep the local draft in sync when the persisted content changes.
  useEffect(() => {
    setValue(content);
  }, [content]);

  const dirty = value !== content;

  return (
    <div className="space-y-3">
      <Textarea
        rows={12}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Shared notes for this trip..."
        className="font-mono text-sm"
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        <Button onClick={() => onSave(value)} disabled={!dirty || isSaving}>
          {isSaving ? "Saving..." : "Save memo"}
        </Button>
      </div>
    </div>
  );
}
