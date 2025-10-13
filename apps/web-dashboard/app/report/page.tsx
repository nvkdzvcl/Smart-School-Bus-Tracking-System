import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"

export default function ReportsPage() {
  return (
    <AppLayout
      title="Báo cáo & Phân tích"
      description="Xem và xuất báo cáo"
      requiredPermission={PERMISSIONS.VIEW_REPORTS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">Reports & analytics coming next...</h3>
        </div>
      </div>
    </AppLayout>
  )
}
