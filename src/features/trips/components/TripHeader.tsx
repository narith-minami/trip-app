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
    <div className="space-y-3">
      <div>
        <Label>Location</Label>
        <Input
          value={editData.location}
          onChange={(e) => setField("location", e.target.value)}
          placeholder="Location"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={editData.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={editData.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
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
        <Button variant="secondary" onClick={editor.cancelEdit}>
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
    <div className="bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            {editor.isEditing ? (
              <input
                type="text"
                value={editor.editData.title}
                onChange={(e) => editor.setField("title", e.target.value)}
                className="border-b-2 border-blue-500 text-3xl font-bold text-gray-900 focus:outline-none"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
            )}
            <p className="mt-1 text-gray-600">
              {trip.startDate} to {trip.endDate}
            </p>
          </div>
          <div className="flex gap-2">
            {isOwner && <OwnerActions editor={editor} onEdit={handleEdit} />}
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>

        {editor.isEditing ? (
          <TripEditFields editor={editor} />
        ) : (
          trip.destination && <p className="text-lg text-gray-700">📍 {trip.destination}</p>
        )}
      </div>
    </div>
  );
}
