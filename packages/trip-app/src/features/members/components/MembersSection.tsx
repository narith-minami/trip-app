/**
 * src/features/members/components/MembersSection.tsx
 *
 * Container for the trip detail "Members" tab.
 */

import { toast } from "sonner";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Card, CardBody } from "@/components/ui/card";
import { useMemberMutations } from "@/features/members/hooks/useMemberMutations";
import { useMembers } from "@/features/members/hooks/useMembers";
import { usePendingIds } from "@/hooks/usePendingIds";
import type { TripMember } from "@/types/entities";
import { InviteLinkBox } from "./InviteLinkBox";
import { MemberAvatarList } from "./MemberAvatarList";

export interface MembersSectionProps {
  tripId: string;
  inviteToken?: string;
  canManage?: boolean;
}

export function MembersSection({ tripId, inviteToken, canManage = false }: MembersSectionProps) {
  const { data: members, isLoading, error } = useMembers(tripId);
  const { remove } = useMemberMutations(tripId);
  const { pendingIds, addPending, clearPending } = usePendingIds();

  const handleRemove = (member: TripMember) => {
    if (!window.confirm(`${member.user?.name ?? "このメンバー"}を削除しますか？`)) return;
    addPending(member.userId);
    remove.mutate(member.userId, {
      onSuccess: () => toast.success("メンバーを削除しました"),
      onError: () => toast.error("メンバーの削除に失敗しました"),
      onSettled: () => clearPending(member.userId),
    });
  };

  if (isLoading) return <LoadingSpinner label="メンバーを読み込み中..." />;
  if (error) return <p className="text-red-600">メンバーの読み込みに失敗しました。</p>;

  return (
    <div className="space-y-6">
      <MemberAvatarList
        members={members ?? []}
        canManage={canManage}
        onRemove={handleRemove}
        pendingIds={pendingIds}
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
