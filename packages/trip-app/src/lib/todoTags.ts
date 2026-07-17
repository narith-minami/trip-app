/**
 * src/lib/todoTags.ts
 *
 * Preset tags for todos. Tags are stored free-form (any string), but these
 * presets give one-tap buttons and consistent colors/icons for the common
 * categories (hotel, transport, food, …). Imports lucide icons, so this is a
 * client-only module — the server validates tags as plain strings.
 */

import type { LucideIcon } from "lucide-react";
import { BedDouble, Bike, Landmark, Plane, ShoppingBag, Tag, Utensils } from "lucide-react";

export { TODO_TAG_MAX, TODO_TAGS_MAX } from "./schemas/todo";

interface TagPreset {
  /** The tag string persisted to the database. */
  tag: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

/**
 * Preset tags. `tag` is the canonical string stored on the todo; free-form
 * tags (anything not in this list) still render, just with a neutral style.
 */
export const TODO_TAG_PRESET_LIST: readonly TagPreset[] = [
  { tag: "ホテル", label: "ホテル", icon: BedDouble, color: "#6366F1" },
  { tag: "移動", label: "移動", icon: Plane, color: "#3B82F6" },
  { tag: "食事", label: "食事", icon: Utensils, color: "#E8643A" },
  { tag: "観光", label: "観光", icon: Landmark, color: "#10B981" },
  { tag: "買い物", label: "買い物", icon: ShoppingBag, color: "#EC4899" },
  { tag: "アクティビティ", label: "アクティビティ", icon: Bike, color: "#F59E0B" },
];

/**
 * Resolve a raw tag string to preset metadata (icon/color). Free-form tags that
 * are not presets fall back to a neutral tag icon and color.
 */
export function resolveTodoTag(tag: string): TagPreset {
  const preset = TODO_TAG_PRESET_LIST.find((p) => p.tag === tag);
  return preset ?? { tag, label: tag, icon: Tag, color: "#9CA3AF" };
}
