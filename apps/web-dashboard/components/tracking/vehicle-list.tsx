import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Bus, Navigation, Gauge } from "lucide-react"
import { mockVehicles, mockDrivers } from "../../lib/mock-data"
import { vehicleStatusLabels, vehicleStatusColors } from "../../lib/utils/status"
import { cn } from "../../lib/utils"

interface VehicleListProps {
  selectedVehicleId?: string
  onSelectVehicle: (vehicleId: string) => void
}

export const VehicleList: React.FC<VehicleListProps> = ({
  selectedVehicleId,
  onSelectVehicle,
}) => {
  const activeVehicles = mockVehicles.filter((v) => v.status === "active")

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Xe đang hoạt động</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-2 p-4 pt-0">
            {activeVehicles.map((vehicle) => {
              const driver = mockDrivers.find((d) => d.id === "d1") // Mock assignment
              const isSelected = selectedVehicleId === vehicle.id

              return (
                <button
                  key={vehicle.id}
                  onClick={() => onSelectVehicle(vehicle.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{vehicle.plateNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {driver?.name}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        vehicleStatusColors[vehicle.status]
                      )}
                    >
                      {vehicleStatusLabels[vehicle.status]}
                    </Badge>
                  </div>

                  {vehicle.currentLocation && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        <span>{vehicle.currentLocation.speed} km/h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span>{vehicle.currentLocation.heading}°</span>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
