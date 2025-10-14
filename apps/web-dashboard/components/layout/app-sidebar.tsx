import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../lib/auth/context"
import { PERMISSIONS } from "../../lib/auth/permissions"
import type { Permission } from "../../lib/auth/permissions"
import { cn } from "../../lib/utils"
import {
  LayoutDashboard,
  Map,
  Calendar,
  Bus,
  Users,
  GraduationCap,
  MapPin,
  ClipboardList,
  UserCheck,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  LogOut,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: Permission
  badge?: number
}

const navItems: NavItem[] = [
  { title: "Tổng quan", href: "/", icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
  { title: "Bản đồ trực tiếp", href: "/tracking", icon: Map, permission: PERMISSIONS.VIEW_LIVE_TRACKING },
  { title: "Lịch & Tuyến", href: "/schedules", icon: Calendar, permission: PERMISSIONS.VIEW_ROUTES },
  { title: "Xe buýt", href: "/vehicles", icon: Bus, permission: PERMISSIONS.VIEW_VEHICLES },
  { title: "Tài xế", href: "/drivers", icon: Users, permission: PERMISSIONS.VIEW_DRIVERS },
  { title: "Học sinh & PH", href: "/students", icon: GraduationCap, permission: PERMISSIONS.VIEW_STUDENTS },
  { title: "Điểm dừng", href: "/stops", icon: MapPin, permission: PERMISSIONS.VIEW_ROUTES },
  { title: "Phân công", href: "/assignments", icon: ClipboardList, permission: PERMISSIONS.VIEW_ASSIGNMENTS },
  { title: "Điểm danh", href: "/attendance", icon: UserCheck, permission: PERMISSIONS.VIEW_DASHBOARD },
  { title: "Sự cố", href: "/incidents", icon: AlertTriangle, permission: PERMISSIONS.VIEW_INCIDENTS, badge: 2 },
  { title: "Tin nhắn", href: "/messages", icon: MessageSquare, permission: PERMISSIONS.VIEW_MESSAGES },
  { title: "Báo cáo", href: "/reports", icon: BarChart3, permission: PERMISSIONS.VIEW_REPORTS },
  { title: "Người dùng", href: "/users", icon: Users, permission: PERMISSIONS.VIEW_USERS },
  { title: "Cấu hình", href: "/settings", icon: Settings, permission: PERMISSIONS.VIEW_SETTINGS },
  { title: "Nhật ký", href: "/audit-logs", icon: FileText, permission: PERMISSIONS.VIEW_AUDIT_LOGS },
]

export const AppSidebar: React.FC = () => {
  const location = useLocation()
  const pathname = location.pathname
  const { user, logout, hasPermission } = useAuth()

  const filteredNavItems = navItems.filter((item) => !item.permission || hasPermission(item.permission!))

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">SSB 1.0</h1>
          <p className="text-xs text-muted-foreground">School Bus System</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} to={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
