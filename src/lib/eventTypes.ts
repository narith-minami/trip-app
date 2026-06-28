import { BedDouble, Bike, Landmark, Plane, ShoppingBag, Tag, Train, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const EVENT_TYPES = {
  food: { label: "食事", icon: Utensils, color: "#E8643A" },
  flight: { label: "飛行機", icon: Plane, color: "#3B82F6" },
  train: { label: "電車", icon: Train, color: "#8B5CF6" },
  sightseeing: { label: "観光", icon: Landmark, color: "#10B981" },
  activity: { label: "アクティビティ", icon: Bike, color: "#F59E0B" },
  hotel: { label: "ホテル", icon: BedDouble, color: "#6366F1" },
  shopping: { label: "買い物", icon: ShoppingBag, color: "#EC4899" },
  other: { label: "その他", icon: Tag, color: "#9CA3AF" },
} as const satisfies Record<string, { label: string; icon: LucideIcon; color: string }>;

export type EventType = keyof typeof EVENT_TYPES;

export const EVENT_TYPE_LIST = Object.entries(EVENT_TYPES).map(([key, value]) => ({
  key: key as EventType,
  ...value,
}));

export function resolveEventType(type?: string | null): (typeof EVENT_TYPES)[EventType] {
  if (type && type in EVENT_TYPES) return EVENT_TYPES[type as EventType];
  return EVENT_TYPES.other;
}
