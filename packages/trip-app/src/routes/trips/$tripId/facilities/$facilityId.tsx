/**
 * src/routes/trips/$tripId/facilities/$facilityId.tsx
 *
 * Facility detail page — a separate screen for a single facility with its
 * address/phone/business-hours info and edit/delete actions.
 */

import { useNavigate, useParams } from "@tanstack/react-router";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { PageHeaderBar } from "@/components/layout/PageHeaderBar";
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
      <ErrorState
        message="施設の読み込みに失敗しました"
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
      <PageHeaderBar title="施設詳細" backLabel="施設一覧に戻る" onBack={handleBack} />
      <PageContainer>
        <FacilityDetail tripId={tripId} facility={facility} canEdit onDeleted={handleBack} />
      </PageContainer>
    </AppShell>
  );
}
