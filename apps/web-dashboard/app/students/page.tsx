import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"

export default function StudentsPage() {
  return (
    <AppLayout
      title="Học sinh & Phụ huynh"
      description="Quản lý học sinh và phụ huynh"
      requiredPermission={PERMISSIONS.VIEW_STUDENTS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">Students & guardians coming next...</h3>
        </div>
      </div>
    </AppLayout>
  )
}
