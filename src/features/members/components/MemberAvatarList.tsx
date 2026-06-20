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
            className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={name} image={member.user?.image} />
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{name}</p>
                {member.user?.email && (
                  <p className="truncate text-sm text-gray-600">{member.user.email}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded px-2 py-1 text-xs",
                  isOwner ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
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
