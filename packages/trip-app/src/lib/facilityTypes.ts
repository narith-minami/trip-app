import type { LucideIcon } from "lucide-react";
import { BedDouble, Landmark, ShoppingBag, Tag, Train, Utensils } from "lucide-react";

export const FACILITY_TYPES = {
  hotel: { label: "ホテル", icon: BedDouble, color: "#6366F1" },
  restaurant: { label: "飲食店", icon: Utensils, color: "#E8643A" },
  sightseeing: { label: "観光", icon: Landmark, color: "#10B981" },
  shopping: { label: "買い物", icon: ShoppingBag, color: "#EC4899" },
  transport: { label: "交通", icon: Train, color: "#8B5CF6" },
  other: { label: "その他", icon: Tag, color: "#9CA3AF" },
} as const satisfies Record<string, { label: string; icon: LucideIcon; color: string }>;

export type FacilityCategory = keyof typeof FACILITY_TYPES;

export const FACILITY_TYPE_LIST = Object.entries(FACILITY_TYPES).map(([key, value]) => ({
  key: key as FacilityCategory,
  ...value,
}));

export function resolveFacilityType(
  category?: string | null
): (typeof FACILITY_TYPES)[FacilityCategory] {
  if (category && Object.hasOwn(FACILITY_TYPES, category))
    return FACILITY_TYPES[category as FacilityCategory];
  return FACILITY_TYPES.other;
}
