/**
 * src/routes/trips/$tripId/index.tsx
 *
 * Trip detail page component.
 * Displays trip information with tabs for schedule, todos, memo, and members.
 */

import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useUpdateTrip, useDeleteTrip } from "@/features/trips/hooks/useTripMutations";
import { toast } from "sonner";

export function TripDetailPage() {
  const { tripId } = useParams({ from: "/trips/$tripId/" });
  const navigate = useNavigate();
  const { data: trip, isLoading, error } = useTripDetail(tripId);
  const [activeTab, setActiveTab] = useState("schedule");
  const [isEditing, setIsEditing] = useState(false);

  const updateTripMutation = useUpdateTrip(tripId);
  const deleteTripMutation = useDeleteTrip();

  const [editData, setEditData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  const handleEdit = () => {
    if (trip) {
      setEditData({
        title: trip.title,
        location: trip.destination || "",
        startDate: trip.startDate,
        endDate: trip.endDate,
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateTripMutation.mutateAsync(editData);
      toast.success("Trip updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update trip");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    try {
      await deleteTripMutation.mutateAsync(tripId);
      toast.success("Trip deleted successfully");
      navigate({ to: "/trips" });
    } catch (error) {
      toast.error("Failed to delete trip");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error loading trip</p>
          <button
            onClick={() => navigate({ to: "/trips" })}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  const isOwner = trip.ownerId === trip.owner?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with cover image */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
              )}
              <p className="text-gray-600 mt-1">
                {trip.startDate} to {trip.endDate}
              </p>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <>
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteTripMutation.isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateTripMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                onClick={() => navigate({ to: "/trips" })}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Location"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editData.startDate}
                    onChange={(e) =>
                      setEditData({ ...editData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editData.endDate}
                    onChange={(e) =>
                      setEditData({ ...editData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {trip.destination && (
                <p className="text-lg text-gray-700">📍 {trip.destination}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex border-b border-gray-200">
          {["schedule", "todos", "memo", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "schedule" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Schedule</h2>
              <p className="text-gray-600">Schedule feature coming soon...</p>
            </div>
          )}

          {activeTab === "todos" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Todos</h2>
              <p className="text-gray-600">Todos feature coming soon...</p>
            </div>
          )}

          {activeTab === "memo" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Memo</h2>
              <p className="text-gray-600">Memo feature coming soon...</p>
            </div>
          )}

          {activeTab === "members" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <div className="space-y-2">
                {trip.members?.map((member: any) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.user?.email}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        member.role === "owner"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.role === "owner" ? "Owner" : "Member"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripDetailPage;
