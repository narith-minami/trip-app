/**
 * src/routes/trips/$tripId/facilities/$facilityId.tsx
 *
 * Facility detail page — a separate screen for a single facility with its
 * address/phone/business-hours info and edit/delete actions.
 */

import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { AppShell, PageContainer } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { FacilityDetail } from "@/features/facilities/components/FacilityDetail";
import { useFacilityDetail } from "@/features/facilities/hooks/useFacilityDetail";

export function FacilityDetailPage() {
  const { tripId, facilityId } = useParams({ from: "/trips/$tripId/facilities/$facilityId" });
  const navigate = useNavigate();
  const { data: facility, isLoading, error } = useFacilityDetail(tripId, facilityId);

  const handleBack = () => navigate({ to: "/trips/$tripId", params: { tripId } });

  if (isLoading) return <LoadingSpinner fullScreen label="施設を読み込み中..." />;

  if (error || !facility) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">施設の読み込みに失敗しました</p>
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
          <Button variant="ghost" size="sm" onClick={handleBack} aria-label="施設一覧に戻る">
            <span className="inline-flex items-center gap-1">
              <ChevronLeft size={16} aria-hidden="true" />
              戻る
            </span>
          </Button>
          <h1 className="font-display text-xl font-semibold text-navy">施設詳細</h1>
        </div>
      </div>
      <PageContainer>
        <FacilityDetail tripId={tripId} facility={facility} canEdit onDeleted={handleBack} />
      </PageContainer>
    </AppShell>
  );
}
