/**
 * src/features/scraps/components/ScrapCard.tsx
 *
 * Displays a single scrap: body, optional image, tags, author and date.
 * The author can toggle inline editing or delete the scrap.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScrapMutations } from "@/features/scraps/hooks/useScrapMutations";
import type { Scrap } from "@/types/entities";
import { ScrapForm, type ScrapFormData } from "./ScrapForm";

interface ScrapCardProps {
  scrap: Scrap;
  isAuthor: boolean;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScrapBody({ scrap }: { scrap: Scrap }) {
  return (
    <>
      {scrap.imageData && (
        <img
          src={scrap.imageData}
          alt="スクラップの画像"
          className="max-h-64 w-full rounded-xl object-cover"
        />
      )}
      {scrap.content && <p className="whitespace-pre-wrap break-words text-ink">{scrap.content}</p>}
      {scrap.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {scrap.tags.map((tag) => (
            <Badge key={tag} variant="navy">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}

function ScrapFooter({
  scrap,
  isAuthor,
  onEdit,
  onDelete,
  deleting,
}: {
  scrap: Scrap;
  isAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-cream-dark pt-3">
      <div className="flex items-center gap-2">
        <Avatar name={scrap.author?.name ?? "?"} image={scrap.author?.image} className="h-7 w-7" />
        <span className="text-sm text-ink-muted">{scrap.author?.name ?? "不明"}</span>
        <span className="text-xs text-ink-light">{formatDate(scrap.createdAt)}</span>
      </div>
      {isAuthor && (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            編集
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700"
          >
            削除
          </Button>
        </div>
      )}
    </div>
  );
}

export function ScrapCard({ scrap, isAuthor }: ScrapCardProps) {
  const { update, remove } = useScrapMutations();
  const [editing, setEditing] = useState(false);

  const handleUpdate = async (data: ScrapFormData) => {
    try {
      await update.mutateAsync({ scrapId: scrap.id, data });
      toast.success("スクラップを更新しました");
      setEditing(false);
    } catch {
      toast.error("スクラップの更新に失敗しました");
      throw new Error("update failed");
    }
  };

  const handleDelete = () => {
    if (!window.confirm("このスクラップを削除しますか？")) return;
    remove.mutate(scrap.id, {
      onSuccess: () => toast.success("スクラップを削除しました"),
      onError: () => toast.error("スクラップの削除に失敗しました"),
    });
  };

  if (editing) {
    return (
      <Card className="p-4">
        <ScrapForm
          initial={{
            content: scrap.content ?? "",
            imageData: scrap.imageData ?? null,
            tags: scrap.tags,
          }}
          submitLabel="更新"
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <ScrapBody scrap={scrap} />
      <ScrapFooter
        scrap={scrap}
        isAuthor={isAuthor}
        onEdit={() => setEditing(true)}
        onDelete={handleDelete}
        deleting={remove.isPending}
      />
    </Card>
  );
}
