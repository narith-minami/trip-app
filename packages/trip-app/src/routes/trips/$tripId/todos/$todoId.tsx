/**
 * src/routes/trips/$tripId/todos/$todoId.tsx
 *
 * Todo detail page — a separate screen for a single todo with the editable
 * description/due date and the chat-style comment timeline.
 */

import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Todoの読み込みに失敗しました</p>
          <Button variant="ghost" className="mt-4" onClick={handleBack}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Todo一覧に戻る">
            <span className="inline-flex items-center gap-1">
              <ChevronLeft size={16} aria-hidden="true" />
              戻る
            </span>
          </Button>
          <h1 className="font-display text-xl font-semibold text-navy">Todo詳細</h1>
        </div>
      </div>
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
