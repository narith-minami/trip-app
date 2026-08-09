/**
 * src/features/todos/hooks/useTodoDetailDelete.ts
 *
 * Delete handler for the todo detail panel: confirms, deletes, and
 * navigates back to the trip page on success.
 */

import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTodoMutations } from "@/features/todos/hooks/useTodoMutations";

export function useTodoDetailDelete(tripId: string, todoId: string, title: string) {
  const navigate = useNavigate();
  const { remove } = useTodoMutations(tripId);

  const handleDelete = () => {
    if (!window.confirm(`「${title}」を削除しますか？`)) return;
    remove.mutate(todoId, {
      onSuccess: () => {
        toast.success("Todoを削除しました");
        void navigate({ to: "/trips/$tripId", params: { tripId } });
      },
      onError: () => toast.error("Todoの削除に失敗しました"),
    });
  };

  return { handleDelete, isDeleting: remove.isPending };
}
