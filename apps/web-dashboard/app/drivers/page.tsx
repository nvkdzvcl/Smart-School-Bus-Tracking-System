"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"
import { DriverStats } from "@/components/drivers/driver-stats"
import { DriverTable } from "@/components/drivers/driver-table"

export default function DriversPage() {
  const [editingDriverId, setEditingDriverId] = useState<string>()

  return (
    <AppLayout title="Tài xế" description="Quản lý tài xế" requiredPermission={PERMISSIONS.VIEW_DRIVERS}>
      <div className="space-y-6">
        <DriverStats />
        <DriverTable onEdit={setEditingDriverId} onCreate={() => console.log("Create driver")} />
      </div>
    </AppLayout>
  )
}
