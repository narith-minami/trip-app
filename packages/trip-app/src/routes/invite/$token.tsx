/**
 * src/routes/invite/$token.tsx
 *
 * Invite acceptance page. Shows a preview of the trip behind an invite
 * token and lets a logged-in user join it; a logged-out visitor is
 * pointed to login/signup and can revisit this same link afterwards.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { fetchInvitePreview, joinTripByInvite } from "@/api/invite";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { QUERY_KEYS } from "@/lib/queryKeys";

function InvalidInvite() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 pt-[env(safe-area-inset-top)]">
      <div className="text-center">
        <p className="text-red-600">この招待リンクは無効です</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate({ to: "/" })}>
          トップに戻る
        </Button>
      </div>
    </div>
  );
}

interface InvitePreview {
  tripId: string;
  title: string;
  destination?: string | null;
  startDate: string;
  endDate: string;
  memberCount: number;
}

function LoggedOutActions() {
  const navigate = useNavigate();
  return (
    <div className="mt-6 flex gap-3">
      <Button className="flex-1" onClick={() => navigate({ to: "/login" })}>
        ログインして参加
      </Button>
      <Button variant="secondary" className="flex-1" onClick={() => navigate({ to: "/signup" })}>
        新規登録
      </Button>
    </div>
  );
}

function JoinAction({ token }: { token: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const join = useMutation({
    mutationFn: () => joinTripByInvite(token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips.list() });
      navigate({ to: "/trips/$tripId", params: { tripId: data.tripId } });
    },
  });

  const handleJoin = () => {
    join.mutate(undefined, {
      onSuccess: () => toast.success("旅行に参加しました"),
      onError: () => toast.error("参加に失敗しました"),
    });
  };

  return (
    <Button className="mt-6 w-full" onClick={handleJoin} disabled={join.isPending}>
      {join.isPending ? "参加中..." : `旅行に参加する`}
    </Button>
  );
}

function InvitePreviewCard({
  preview,
  token,
  isLoggedIn,
}: {
  preview: InvitePreview;
  token: string;
  isLoggedIn: boolean;
}) {
  return (
    <Card>
      <CardBody>
        <h1 className="font-display text-2xl font-bold text-ink">{preview.title}</h1>
        {preview.destination && (
          <p className="mt-1 flex items-center gap-1 text-ink-muted">
            <MapPin size={14} aria-hidden="true" />
            {preview.destination}
          </p>
        )}
        <p className="mt-1 text-sm text-ink-muted">
          {preview.startDate} 〜 {preview.endDate}
        </p>
        <p className="mt-1 text-sm text-ink-light">参加者 {preview.memberCount}人</p>

        {isLoggedIn ? <JoinAction token={token} /> : <LoggedOutActions />}
      </CardBody>
    </Card>
  );
}

export function InvitePage() {
  const { token } = useParams({ from: "/invite/$token" });
  const { data: session, isPending: isSessionPending } = useSession();

  const {
    data: preview,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.trips.byInviteToken(token),
    queryFn: () => fetchInvitePreview(token),
  });

  if (isLoading || isSessionPending) return <LoadingSpinner fullScreen label="読み込み中..." />;
  if (error || !preview) return <InvalidInvite />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-sm font-medium text-ink-muted">旅行への招待</p>
        <InvitePreviewCard preview={preview} token={token} isLoggedIn={!!session} />
      </div>
    </div>
  );
}
