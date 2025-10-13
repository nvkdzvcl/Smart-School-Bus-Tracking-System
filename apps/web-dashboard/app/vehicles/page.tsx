"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { PERMISSIONS } from "@/lib/auth/permissions"
import { VehicleStats } from "@/components/vehicles/vehicle-stats"
import { VehicleTable } from "@/components/vehicles/vehicle-table"

export default function VehiclesPage() {
  const [editingVehicleId, setEditingVehicleId] = useState<string>()

  return (
    <AppLayout title="Xe buýt" description="Quản lý đội xe" requiredPermission={PERMISSIONS.VIEW_VEHICLES}>
      <div className="space-y-6">
        <VehicleStats />
        <VehicleTable onEdit={setEditingVehicleId} onCreate={() => console.log("Create vehicle")} />
      </div>
    </AppLayout>
  )
}
