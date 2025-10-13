import React from "react"
import { Card, CardContent } from "../ui/card"
import { Bus, Wrench, WifiOff } from "lucide-react"
import { mockVehicles } from "../../lib/mock-data"

export const VehicleStats: React.FC = () => {
  const stats = {
    total: mockVehicles.length,
    active: mockVehicles.filter((v) => v.status === "active").length,
    maintenance: mockVehicles.filter((v) => v.status === "maintenance").length,
    offline: mockVehicles.filter((v) => v.status === "offline").length,
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Tổng số xe */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng số xe</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Đang hoạt động */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <Bus className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bảo dưỡng */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-secondary/10 p-3">
              <Wrench className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bảo dưỡng</p>
              <p className="text-2xl font-bold">{stats.maintenance}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ngoại tuyến */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-destructive/10 p-3">
              <WifiOff className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngoại tuyến</p>
              <p className="text-2xl font-bold">{stats.offline}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
