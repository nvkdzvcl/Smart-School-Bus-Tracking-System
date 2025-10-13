import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"

export default function MessagesPage() {
  return (
    <AppLayout
      title="Trung tâm tin nhắn"
      description="Gửi và quản lý tin nhắn"
      requiredPermission={PERMISSIONS.VIEW_MESSAGES}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">Messaging center coming next...</h3>
        </div>
      </div>
    </AppLayout>
  )
}
