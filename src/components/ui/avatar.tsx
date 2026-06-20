/**
 * src/components/ui/avatar.tsx
 *
 * Circular avatar that shows a user image or falls back to initials.
 */

import { cn } from "@/lib/cn";

export interface AvatarProps {
  name: string;
  image?: string | null;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

export function Avatar({ name, image, className }: AvatarProps) {
  const base = cn(
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden",
    className
  );

  if (image) {
    return <img src={image} alt={name} className={cn(base, "object-cover")} />;
  }

  return (
    <span className={cn(base, "bg-blue-100 text-blue-700 text-sm font-medium")}>
      {initials(name)}
    </span>
  );
}
