/**
 * src/features/trips/components/TripHeader.tsx
 *
 * Header for the trip detail page: title, dates, owner actions
 * (edit / delete / save / cancel) and the inline edit form.
 */

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { useTripEditor } from "@/features/trips/hooks/useTripEditor";

type TripEditor = ReturnType<typeof useTripEditor>;

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
  onBack: () => void;
}

function TripEditFields({ editor }: { editor: TripEditor }) {
  const { editData, setField } = editor;
  return (
    <div className="mt-4 space-y-3">
      <div>
        <Label className="text-cream-mid">Location</Label>
        <Input
          value={editData.location}
          onChange={(e) => setField("location", e.target.value)}
          placeholder="Location"
          className="border-cream-dark/40 bg-navy-mid text-white placeholder:text-ink-light focus:ring-coral"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-cream-mid">Start Date</Label>
          <Input
            type="date"
            value={editData.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
            className="border-cream-dark/40 bg-navy-mid text-white focus:ring-coral"
          />
        </div>
        <div>
          <Label className="text-cream-mid">End Date</Label>
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

function OwnerActions({ editor, onEdit }: { editor: TripEditor; onEdit: () => void }) {
  if (editor.isEditing) {
    return (
      <>
        <Button variant="success" onClick={editor.save} disabled={editor.isSaving}>
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={editor.cancelEdit}
          className="border-cream-dark/40 text-white hover:bg-navy-mid"
        >
          Cancel
        </Button>
      </>
    );
  }
  return (
    <>
      <Button onClick={onEdit}>Edit</Button>
      <Button variant="danger" onClick={editor.remove} disabled={editor.isDeleting}>
        Delete
      </Button>
    </>
  );
}

export function TripHeader({ trip, isOwner, editor, onBack }: TripHeaderProps) {
  const handleEdit = () =>
    editor.startEdit({
      title: trip.title,
      location: trip.destination ?? "",
      startDate: trip.startDate,
      endDate: trip.endDate,
    });

  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-1 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            {editor.isEditing ? (
              <input
                type="text"
                value={editor.editData.title}
                onChange={(e) => editor.setField("title", e.target.value)}
                className="w-full border-b-2 border-coral bg-transparent font-display text-2xl font-semibold text-white focus:outline-none"
                aria-label="Trip Title"
              />
            ) : (
              <h1 className="font-display text-2xl font-semibold text-white">{trip.title}</h1>
            )}
            <p className="mt-1 text-sm text-cream-mid">
              {trip.startDate} – {trip.endDate}
            </p>
            {!editor.isEditing && trip.destination && (
              <p className="mt-0.5 text-sm text-ink-light">📍 {trip.destination}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {isOwner && <OwnerActions editor={editor} onEdit={handleEdit} />}
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-navy-mid hover:text-white"
            >
              ← Back
            </Button>
          </div>
        </div>

        {editor.isEditing && <TripEditFields editor={editor} />}
      </div>
    </div>
  );
}
