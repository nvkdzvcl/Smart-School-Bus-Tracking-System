import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"

export default function SettingsPage() {
  return (
    <AppLayout
      title="Cấu hình hệ thống"
      description="Cài đặt và tùy chỉnh"
      requiredPermission={PERMISSIONS.VIEW_SETTINGS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">System settings coming next...</h3>
        </div>
      </div>
    </AppLayout>
  )
}
