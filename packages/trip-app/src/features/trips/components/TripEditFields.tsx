/**
 * src/features/trips/components/TripEditFields.tsx
 *
 * Inline edit form rendered inside TripHeader while a trip is being edited:
 * cover thumbnail, location and date range.
 */

import { Input, Label } from "@/components/ui/input";
import { TripCoverField } from "@/features/trips/components/TripCoverField";
import type { useTripEditor } from "@/features/trips/hooks/useTripEditor";

type TripEditor = ReturnType<typeof useTripEditor>;

export function TripEditFields({
  editor,
  tripId,
  coverImageUrl,
}: {
  editor: TripEditor;
  tripId: string;
  coverImageUrl?: string | null;
}) {
  const { editData, setField } = editor;
  return (
    <div className="mt-4 space-y-3">
      <TripCoverField tripId={tripId} coverImageUrl={coverImageUrl} />
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
