import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import { Bus, User, Clock, MessageSquare, Navigation, Gauge, Fuel, X } from "lucide-react"
import { mockVehicles, mockDrivers, mockStudents, mockStops } from "../../lib/mock-data"
import { vehicleStatusLabels, vehicleStatusColors } from "../../lib/utils/status"
import { cn } from "../../lib/utils"

interface VehicleDetailPanelProps {
  vehicleId: string
  onClose: () => void
}

export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({ vehicleId, onClose }) => {
  const vehicle = mockVehicles.find((v) => v.id === vehicleId)
  const driver = mockDrivers[0] // Mock assignment
  const upcomingStops = mockStops.slice(0, 3)
  const studentsOnBoard = mockStudents.slice(0, 5)

  if (!vehicle) return null

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Chi tiết xe</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vehicle Info */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bus className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{vehicle.plateNumber}</h3>
            <Badge variant="outline" className={cn("text-xs mt-1", vehicleStatusColors[vehicle.status])}>
              {vehicleStatusLabels[vehicle.status]}
            </Badge>
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">{driver.name}</p>
            <p className="text-xs text-muted-foreground">{driver.phone}</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 bg-transparent">
            <MessageSquare className="h-3 w-3 mr-1" />
            Nhắn tin
          </Button>
        </div>

        <Separator />

        {/* Current Status */}
        {vehicle.currentLocation && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Trạng thái hiện tại</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Gauge className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Tốc độ</p>
                  <p className="text-sm font-medium">{vehicle.currentLocation.speed} km/h</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Navigation className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Hướng</p>
                  <p className="text-sm font-medium">{vehicle.currentLocation.heading}°</p>
                </div>
              </div>

              {vehicle.fuelLevel != null && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Fuel className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nhiên liệu</p>
                    <p className="text-sm font-medium">{vehicle.fuelLevel}%</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Học sinh</p>
                  <p className="text-sm font-medium">
                    {studentsOnBoard.length}/{vehicle.capacity}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Upcoming Stops */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Điểm dừng sắp tới</h4>
          <div className="space-y-2">
            {upcomingStops.map((stop, index) => (
              <div key={stop.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{stop.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>ETA: {5 + index * 7} phút</span>
                    <span>•</span>
                    <span>{stop.studentIds.length} học sinh</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Students on Board */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Học sinh trên xe ({studentsOnBoard.length})</h4>
          <div className="space-y-2">
            {studentsOnBoard.map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.grade} - {student.code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
