/**
 * src/features/trips/components/TripColorSettings.tsx
 *
 * Dialog for customizing the trip detail page background color and the hero
 * header color. Values are persisted per-trip via `useTripColors` (localStorage).
 */

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/input";
import {
  DEFAULT_BACKGROUND,
  HEADER_PICKER_DEFAULT,
  type TripColors,
} from "@/features/trips/hooks/useTripColors";
import { cn } from "@/lib/cn";

const BACKGROUND_PRESETS = ["#fff8f0", "#f5ede0", "#e8d9c5", "#ffffff", "#eef2f7", "#f3f0ff"];
const HEADER_PRESETS = ["#5b8a6f", "#243d5c", "#0f1c2e", "#ff6b47", "#d4a854", "#1a2e48"];

export interface TripColorSettingsProps {
  open: boolean;
  onClose: () => void;
  backgroundColor: string | null;
  headerColor: string | null;
  onSave: (partial: Partial<TripColors>) => void;
  onReset: () => void;
}

interface SwatchRowProps {
  presets: string[];
  value: string;
  onSelect: (color: string) => void;
  labelPrefix: string;
}

function SwatchRow({ presets, value, onSelect, labelPrefix }: SwatchRowProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {presets.map((preset) => {
        const selected = preset.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={preset}
            type="button"
            onClick={() => onSelect(preset)}
            aria-label={`${labelPrefix} ${preset}`}
            aria-pressed={selected}
            className={cn(
              "h-8 w-8 rounded-full border transition",
              selected ? "border-coral ring-2 ring-coral" : "border-cream-dark"
            )}
            style={{ backgroundColor: preset }}
          />
        );
      })}
    </div>
  );
}

/**
 * Inner form. Rendered only while the dialog is open (Dialog returns null when
 * closed), so its draft state is freshly initialized from props on each open —
 * no props→state sync via useEffect needed.
 */
function ColorSettingsForm({
  backgroundColor,
  headerColor,
  onClose,
  onSave,
  onReset,
}: Omit<TripColorSettingsProps, "open">) {
  const [bg, setBg] = useState(backgroundColor ?? DEFAULT_BACKGROUND);
  const [header, setHeader] = useState(headerColor ?? HEADER_PICKER_DEFAULT);

  const handleSave = () => {
    onSave({ backgroundColor: bg, headerColor: header });
    toast.success("配色を保存しました");
    onClose();
  };

  const handleReset = () => {
    onReset();
    toast.success("配色をデフォルトに戻しました");
    onClose();
  };

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="trip-bg-color">背景色</Label>
        <div className="flex items-center gap-3">
          <input
            id="trip-bg-color"
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            aria-label="背景色を選択"
            className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-cream-dark bg-white p-1"
          />
          <span className="font-mono text-sm text-ink-muted">{bg}</span>
        </div>
        <SwatchRow presets={BACKGROUND_PRESETS} value={bg} onSelect={setBg} labelPrefix="背景色" />
      </div>

      <div>
        <Label htmlFor="trip-header-color">ヘッダー色</Label>
        <div className="flex items-center gap-3">
          <input
            id="trip-header-color"
            type="color"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            aria-label="ヘッダー色を選択"
            className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-cream-dark bg-white p-1"
          />
          <span className="font-mono text-sm text-ink-muted">{header}</span>
        </div>
        <SwatchRow
          presets={HEADER_PRESETS}
          value={header}
          onSelect={setHeader}
          labelPrefix="ヘッダー色"
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button variant="ghost" onClick={handleReset}>
          デフォルトに戻す
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TripColorSettings({ open, onClose, ...rest }: TripColorSettingsProps) {
  return (
    <Dialog open={open} onClose={onClose} title="配色をカスタマイズ">
      <ColorSettingsForm onClose={onClose} {...rest} />
    </Dialog>
  );
}
