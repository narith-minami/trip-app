/**
 * src/features/members/components/MembersSection.tsx
 *
 * Container for the trip detail "Members" tab.
 */

import { removeMember } from "@/api/members";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Card, CardBody } from "@/components/ui/card";
import { useMembers } from "@/features/members/hooks/useMembers";
import { QUERY_KEYS } from "@/lib/queryKeys";
import type { TripMember } from "@/types/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { InviteLinkBox } from "./InviteLinkBox";
import { MemberAvatarList } from "./MemberAvatarList";

export interface MembersSectionProps {
  tripId: string;
  inviteToken?: string;
  canManage?: boolean;
}

export function MembersSection({ tripId, inviteToken, canManage = false }: MembersSectionProps) {
  const { data: members, isLoading, error } = useMembers(tripId);
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | undefined>();

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(tripId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.members.all(tripId) }),
  });

  const handleRemove = async (member: TripMember) => {
    if (!window.confirm(`Remove ${member.user?.name ?? "this member"}?`)) return;
    setPendingId(member.userId);
    try {
      await removeMutation.mutateAsync(member.userId);
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setPendingId(undefined);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading members..." />;
  if (error) return <p className="text-red-600">Failed to load members.</p>;

  return (
    <div className="space-y-6">
      <MemberAvatarList
        members={members ?? []}
        canManage={canManage}
        onRemove={handleRemove}
        pendingId={pendingId}
      />

      {canManage && inviteToken && (
        <Card>
          <CardBody>
            <InviteLinkBox inviteToken={inviteToken} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
