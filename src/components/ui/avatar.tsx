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

const FALLBACK_GRADIENTS = [
  "from-coral to-coral-light",
  "from-sage to-sage-light",
  "from-gold to-gold-light",
  "from-ink-muted to-ink-light",
] as const;

function fallbackGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
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
    <span
      className={cn(
        base,
        "bg-gradient-to-br text-white text-sm font-semibold",
        fallbackGradient(name)
      )}
    >
      {initials(name)}
    </span>
  );
}
