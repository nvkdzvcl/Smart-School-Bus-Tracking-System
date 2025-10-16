import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../lib/auth/UseAuth"
import type { Permission } from "../../lib/auth/Permissions"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: Permission
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
          <p className="text-gray-500">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
