import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"

export default function UsersPage() {
  return (
    <AppLayout
      title="Người dùng & Phân quyền"
      description="Quản lý người dùng và vai trò"
      requiredPermission={PERMISSIONS.VIEW_USERS}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">Users & RBAC coming next...</h3>
        </div>
      </div>
    </AppLayout>
  )
}
