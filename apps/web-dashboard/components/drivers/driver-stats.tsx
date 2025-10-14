import React from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react"
import { mockDrivers } from "../../lib/mock-data"

export const DriverStats: React.FC = () => {
  const stats = {
    total: mockDrivers.length,
    active: mockDrivers.filter((d) => d.status === "active").length,
    onLeave: mockDrivers.filter((d) => d.status === "on-leave").length,
    violations: mockDrivers.reduce((sum, d) => sum + d.violations, 0),
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Tổng tài xế */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tài xế</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Đang làm việc */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang làm việc</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nghỉ phép */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <UserX className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nghỉ phép</p>
              <p className="text-2xl font-bold">{stats.onLeave}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vi phạm */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-secondary/10 p-3">
              <AlertTriangle className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vi phạm</p>
              <p className="text-2xl font-bold">{stats.violations}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
