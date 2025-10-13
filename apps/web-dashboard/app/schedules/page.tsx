"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "@/components/schedules/calendar-view"
import { RouteList } from "@/components/schedules/route-list"
import { RouteBuilder } from "@/components/schedules/route-builder"
import { AssignmentGrid } from "@/components/schedules/assignment-grid"

export default function SchedulesPage() {
  const [showRouteBuilder, setShowRouteBuilder] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string>()

  return (
    <AppLayout
      title="Lịch & Tuyến"
      description="Lập lịch tuần/tháng, cấu hình tuyến"
      requiredPermission={PERMISSIONS.VIEW_ROUTES}
    >
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Lịch</TabsTrigger>
          <TabsTrigger value="routes">Tuyến</TabsTrigger>
          <TabsTrigger value="assignments">Phân công</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView />
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <RouteList onSelectRoute={setSelectedRouteId} onCreateRoute={() => setShowRouteBuilder(true)} />
            </div>

            <div className="lg:col-span-8">
              {showRouteBuilder ? (
                <RouteBuilder onClose={() => setShowRouteBuilder(false)} />
              ) : (
                <div className="flex items-center justify-center h-[600px] border border-dashed border-border rounded-lg">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Chọn tuyến để xem chi tiết</p>
                    <p className="text-xs text-muted-foreground">hoặc tạo tuyến mới</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <AssignmentGrid />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
