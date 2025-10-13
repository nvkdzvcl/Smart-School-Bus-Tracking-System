import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { MapPin } from "lucide-react"
import { mockVehicles } from "../../../lib/mock-data"

export const MiniMap: React.FC = () => {
  const activeVehicles = mockVehicles.filter((v) => v.status === "active" && v.currentLocation)

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vị trí xe hiện tại</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {activeVehicles.length} xe đang chạy
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative h-[300px] rounded-lg bg-muted/50 overflow-hidden">
          {/* Placeholder map - in production, use Google Maps or Mapbox */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Bản đồ tích hợp sẽ hiển thị ở đây</p>
              <p className="text-xs text-muted-foreground">Google Maps / Mapbox</p>
            </div>
          </div>

          {/* Vehicle markers overlay */}
          <div className="absolute inset-0 p-4">
            {activeVehicles.slice(0, 3).map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="absolute"
                style={{
                  left: `${20 + index * 25}%`,
                  top: `${30 + index * 15}%`,
                }}
              >
                <div className="relative group">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                    <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                      <p className="text-xs font-medium">{vehicle.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.currentLocation?.speed} km/h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
