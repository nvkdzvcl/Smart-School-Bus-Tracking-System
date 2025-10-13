import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"
import { KPICard } from "@/components/dashboard/kpi-card"
import { MiniMap } from "@/components/dashboard/mini-map"
import { UpcomingStops } from "@/components/dashboard/upcoming-stops"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Bus, GraduationCap, AlertTriangle, TrendingUp, Activity } from "lucide-react"
import { mockDashboardKPI } from "@/lib/mock-data"

export default function DashboardPage() {
  const kpi = mockDashboardKPI

  return (
    <AppLayout
      title="Tổng quan"
      description="Tình trạng đội xe & lịch vận hành hôm nay"
      requiredPermission={PERMISSIONS.VIEW_DASHBOARD}
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Tuyến hoạt động"
            value={kpi.activeRoutes}
            subtitle="/ 15 tuyến"
            icon={<Activity className="h-6 w-6 text-primary" />}
            trend={{ value: 8, isPositive: true }}
          />
          <KPICard
            title="Xe đang chạy"
            value={`${kpi.activeVehicles}/${kpi.totalVehicles}`}
            icon={<Bus className="h-6 w-6 text-primary" />}
            trend={{ value: 5, isPositive: true }}
          />
          <KPICard
            title="Học sinh đã đón"
            value={`${Math.round((kpi.studentsPickedUp / kpi.totalStudents) * 100)}%`}
            subtitle={`${kpi.studentsPickedUp}/${kpi.totalStudents}`}
            icon={<GraduationCap className="h-6 w-6 text-primary" />}
            trend={{ value: 12, isPositive: true }}
          />
          <KPICard
            title="Sự cố mở"
            value={kpi.openIncidents}
            icon={<AlertTriangle className="h-6 w-6 text-secondary" />}
            className="border-secondary/20"
          />
        </div>

        {/* On-time Performance */}
        <div className="grid gap-6 lg:grid-cols-3">
          <KPICard
            title="Đúng giờ hôm nay"
            value={`${kpi.onTimePerformance}%`}
            icon={<TrendingUp className="h-6 w-6 text-green-500" />}
            trend={{ value: 2.5, isPositive: true }}
            className="lg:col-span-1"
          />
          <div className="lg:col-span-2">
            <MiniMap />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <UpcomingStops />
            <QuickActions />
          </div>
          <RecentAlerts />
        </div>
      </div>
    </AppLayout>
  )
}
