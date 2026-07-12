/**
 * src/features/scraps/components/ScrapComposer.tsx
 *
 * Create form for a new scrap, shown at the top of the scraps page.
 */

import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useScrapMutations } from "@/features/scraps/hooks/useScrapMutations";
import { ScrapForm, type ScrapFormData } from "./ScrapForm";

export function ScrapComposer() {
  const { create } = useScrapMutations();

  const handleSubmit = async (data: ScrapFormData) => {
    try {
      await create.mutateAsync(data);
      toast.success("スクラップを追加しました");
    } catch {
      toast.error("スクラップの追加に失敗しました");
      throw new Error("create failed"); // keep form values for retry
    }
  };

  return (
    <Card className="p-4">
      <h2 className="mb-3 font-display text-lg font-semibold text-navy">新しいスクラップ</h2>
      <ScrapForm submitLabel="追加" onSubmit={handleSubmit} resetOnSubmit />
    </Card>
  );
}
