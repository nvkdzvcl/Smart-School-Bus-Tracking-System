import React from "react"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"
import { ProtectedRoute } from "../auth/ProtectedRoute"
import type { Permission } from "../../lib/auth/Permissions"

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
  requiredPermission?: Permission
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  description,
  actions,
  requiredPermission,
}) => {
  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader title={title} description={description} actions={actions} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
