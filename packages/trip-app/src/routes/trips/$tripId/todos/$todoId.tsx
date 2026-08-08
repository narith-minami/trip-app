/**
 * src/routes/trips/$tripId/todos/$todoId.tsx
 *
 * Todo detail page — a separate screen for a single todo with the editable
 * description/due date and the chat-style comment timeline.
 */

import { useNavigate, useParams } from "@tanstack/react-router";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { PageHeaderBar } from "@/components/layout/PageHeaderBar";
import { AppShell, PageContainer } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { TodoDetail } from "@/features/todos/components/TodoDetail";
import { useTodoDetail } from "@/features/todos/hooks/useTodoDetail";
import { useTripDetail } from "@/features/trips/hooks/useTripDetail";
import { useSession } from "@/lib/auth-client";

export function TodoDetailPage() {
  const { tripId, todoId } = useParams({ from: "/trips/$tripId/todos/$todoId" });
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: trip } = useTripDetail(tripId);
  const { data: todo, isLoading, error } = useTodoDetail(tripId, todoId);

  const handleBack = () => navigate({ to: "/trips/$tripId", params: { tripId } });

  if (isLoading) return <LoadingSpinner fullScreen label="Todoを読み込み中..." />;

  if (error || !todo) {
    return (
      <ErrorState
        message="Todoの読み込みに失敗しました"
        fullScreen
        action={
          <Button variant="ghost" onClick={handleBack}>
            戻る
          </Button>
        }
      />
    );
  }

  return (
    <AppShell>
      <PageHeaderBar title="Todo詳細" backLabel="Todo一覧に戻る" onBack={handleBack} />
      <PageContainer>
        <TodoDetail
          tripId={tripId}
          todo={todo}
          members={trip?.members}
          currentUserId={session?.user?.id}
        />
      </PageContainer>
    </AppShell>
  );
}
