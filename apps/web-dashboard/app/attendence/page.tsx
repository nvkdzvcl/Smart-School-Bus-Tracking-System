import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"

export default function AttendancePage() {
  return (
    <AppLayout
      title="Điểm danh / Boarding"
      description="Nhật ký điểm danh học sinh"
      requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">Attendance logs coming next...</h3>
        </div>
      </div>
    </AppLayout>
  )
}
