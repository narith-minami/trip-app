/**
 * src/features/members/components/MemberAvatarList.tsx
 *
 * Lists trip members with avatar, role and an optional remove action.
 */

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { TripMember } from "@/types/entities";

export interface MemberAvatarListProps {
  members: TripMember[];
  canManage?: boolean;
  onRemove?: (member: TripMember) => void;
  pendingId?: string;
}

export function MemberAvatarList({
  members,
  canManage = false,
  onRemove,
  pendingId,
}: MemberAvatarListProps) {
  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isOwner = member.role === "owner";
        const name = member.user?.name ?? member.userId;
        return (
          <div
            key={member.userId}
            className="flex items-center justify-between gap-3 rounded-lg bg-cream p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={name} image={member.user?.image} />
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{name}</p>
                {member.user?.email && (
                  <p className="truncate text-sm text-ink-muted">{member.user.email}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  isOwner ? "bg-coral/10 text-coral" : "bg-cream-dark text-ink-muted"
                )}
              >
                {isOwner ? "Owner" : "Member"}
              </span>
              {canManage && !isOwner && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pendingId === member.userId}
                  onClick={() => onRemove?.(member)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
