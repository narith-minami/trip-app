/**
 * src/features/memo/components/MemoSection.tsx
 *
 * Container for the trip detail "Memo" tab.
 */

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useTripMemo } from "@/features/memo/hooks/useMemo";
import { useMemoUpdateMutation } from "@/features/memo/hooks/useMemoUpdateMutation";
import { toast } from "sonner";
import { MemoEditor } from "./MemoEditor";

export interface MemoSectionProps {
  tripId: string;
}

export function MemoSection({ tripId }: MemoSectionProps) {
  const { data: memo, isLoading, error } = useTripMemo(tripId);
  const updateMutation = useMemoUpdateMutation(tripId);

  const handleSave = async (content: string) => {
    try {
      await updateMutation.mutateAsync(content);
      toast.success("Memo saved");
    } catch {
      toast.error("Failed to save memo");
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading memo..." />;
  if (error) return <p className="text-red-600">Failed to load memo.</p>;

  return (
    <MemoEditor
      content={memo?.content ?? ""}
      isSaving={updateMutation.isPending}
      onSave={handleSave}
    />
  );
}
