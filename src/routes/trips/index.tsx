/**
 * src/routes/trips/index.tsx
 *
 * Trips list page component.
 * Displays all user's trips with options to create, view, and manage them.
 */

import { useCreateTrip } from "@/features/trips/hooks/useTripMutations";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

const FIELD_CLASS =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

interface TripListItem {
  id: string;
  title: string;
  destination?: string | null;
  coverImageUrl?: string | null;
  startDate: string;
  endDate: string;
  members?: Array<{ role: string }>;
}

interface CreateTripFormData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

const EMPTY_FORM: CreateTripFormData = {
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

/** Full-screen centered status message with an optional spinner. */
function CenteredMessage({
  message,
  tone = "default",
}: {
  message: string;
  tone?: "default" | "error";
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {tone === "default" && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        )}
        <p className={tone === "error" ? "text-red-600" : "text-gray-600"}>{message}</p>
      </div>
    </div>
  );
}

/** A single trip summary card. */
function TripCard({ trip, onSelect }: { trip: TripListItem; onSelect: (id: string) => void }) {
  const isOwner = trip.members?.some((m) => m.role === "owner");
  return (
    <button
      type="button"
      onClick={() => onSelect(trip.id)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden text-left"
    >
      {trip.coverImageUrl && (
        <div className="w-full h-48 bg-gray-200">
          <img src={trip.coverImageUrl} alt={trip.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h2>
        {trip.destination && <p className="text-gray-600 mb-2">{trip.destination}</p>}
        <p className="text-sm text-gray-500 mb-4">
          {trip.startDate} to {trip.endDate}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{trip.members?.length || 0} members</div>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {isOwner ? "Owner" : "Member"}
          </span>
        </div>
      </div>
    </button>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

/** Labelled single-line text/date input. */
function TextField({ id, label, value, onChange, type = "text", placeholder }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CLASS}
      />
    </div>
  );
}

interface TripFormFieldsProps {
  formData: CreateTripFormData;
  onChange: (data: CreateTripFormData) => void;
}

/** The set of inputs used to create a trip. */
function TripFormFields({ formData, onChange }: TripFormFieldsProps) {
  return (
    <div className="space-y-4">
      <TextField
        id="trip-title"
        label="Trip Title *"
        value={formData.title}
        placeholder="e.g., Summer Vacation"
        onChange={(title) => onChange({ ...formData, title })}
      />
      <TextField
        id="trip-location"
        label="Location"
        value={formData.location}
        placeholder="e.g., Paris, France"
        onChange={(location) => onChange({ ...formData, location })}
      />
      <TextField
        id="trip-start"
        label="Start Date *"
        type="date"
        value={formData.startDate}
        onChange={(startDate) => onChange({ ...formData, startDate })}
      />
      <TextField
        id="trip-end"
        label="End Date *"
        type="date"
        value={formData.endDate}
        onChange={(endDate) => onChange({ ...formData, endDate })}
      />
      <div>
        <label htmlFor="trip-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="trip-description"
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          className={FIELD_CLASS}
          placeholder="Trip details..."
          rows={3}
        />
      </div>
    </div>
  );
}

interface CreateTripModalProps {
  formData: CreateTripFormData;
  onChange: (data: CreateTripFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isPending: boolean;
}

/** Modal containing the new-trip creation form. */
function CreateTripModal({
  formData,
  onChange,
  onSubmit,
  onClose,
  isPending,
}: CreateTripModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Create New Trip</h2>
        <form onSubmit={onSubmit}>
          <TripFormFields formData={formData} onChange={onChange} />
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Empty-state shown when the user has no trips yet. */
function EmptyTrips({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600 mb-4">No trips yet. Create your first trip!</p>
      <button
        type="button"
        onClick={onCreate}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Create First Trip
      </button>
    </div>
  );
}

/** Page header with the title and the "new trip" action. */
function TripsHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <button
            type="button"
            onClick={onCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Trip
          </button>
        </div>
      </div>
    </div>
  );
}

export function TripsPage() {
  const navigate = useNavigate();
  const { data: tripsData, isLoading, error } = useTrips();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateTripFormData>(EMPTY_FORM);
  const createTripMutation = useCreateTrip();

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createTripMutation.mutateAsync(formData);
      toast.success("Trip created successfully");
      setShowCreateModal(false);
      setFormData(EMPTY_FORM);
    } catch (_error) {
      toast.error("Failed to create trip");
    }
  };

  const handleTripClick = (tripId: string) => {
    navigate({ to: `/trips/${tripId}` });
  };

  if (isLoading) return <CenteredMessage message="Loading trips..." />;
  if (error) return <CenteredMessage message="Error loading trips" tone="error" />;

  const trips = (tripsData?.data ?? []) as TripListItem[];

  return (
    <div className="min-h-screen bg-gray-50">
      <TripsHeader onCreate={() => setShowCreateModal(true)} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {trips.length === 0 ? (
          <EmptyTrips onCreate={() => setShowCreateModal(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onSelect={handleTripClick} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTripModal
          formData={formData}
          onChange={setFormData}
          onSubmit={handleCreateTrip}
          onClose={() => setShowCreateModal(false)}
          isPending={createTripMutation.isPending}
        />
      )}
    </div>
  );
}

export default TripsPage;
