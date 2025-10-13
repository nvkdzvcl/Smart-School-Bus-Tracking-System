import React, { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { MapPin, Play, Maximize2 } from "lucide-react"
import { mockVehicles } from "../../lib/mock-data"

interface TrackingMapProps {
  selectedVehicleId?: string
  onVehicleClick: (vehicleId: string) => void
}

export const TrackingMap: React.FC<TrackingMapProps> = ({ selectedVehicleId, onVehicleClick }) => {
  const [isReplayMode, setIsReplayMode] = useState(false)
  const activeVehicles = mockVehicles.filter((v) => v.status === "active" && v.currentLocation)

  return (
    <Card className="border-border h-full">
      <CardContent className="p-0 relative">
        {/* Map Container */}
        <div className="relative h-[calc(100vh-16rem)] rounded-lg bg-muted/50 overflow-hidden">
          {/* Placeholder map - in production, use Google Maps or Mapbox */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Bản đồ tích hợp sẽ hiển thị ở đây</p>
              <p className="text-xs text-muted-foreground">Google Maps / Mapbox với real-time tracking</p>
            </div>
          </div>

          {/* Vehicle markers overlay */}
          <div className="absolute inset-0 p-8">
            {activeVehicles.map((vehicle, index) => {
              const isSelected = selectedVehicleId === vehicle.id
              return (
                <button
                  key={vehicle.id}
                  onClick={() => onVehicleClick(vehicle.id)}
                  className="absolute group"
                  style={{
                    left: `${15 + index * 20}%`,
                    top: `${25 + index * 15}%`,
                  }}
                >
                  <div className="relative">
                    {/* Pulse animation */}
                    <div
                      className={`absolute inset-0 rounded-full ${
                        isSelected ? "bg-secondary" : "bg-primary"
                      } animate-ping opacity-75`}
                    />
                    {/* Marker */}
                    <div
                      className={`relative h-4 w-4 rounded-full ${
                        isSelected ? "bg-secondary" : "bg-primary"
                      } border-2 border-background shadow-lg`}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg whitespace-nowrap">
                        <p className="text-sm font-medium">{vehicle.plateNumber}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.currentLocation?.speed} km/h</p>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 h-2 w-2 bg-card border-r border-b border-border" />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="h-10 w-10 bg-card shadow-lg">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Replay Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsReplayMode((v) => !v)}
              className="bg-card shadow-lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {isReplayMode ? "Dừng Replay" : "Replay hành trình"}
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg">
            <p className="text-xs font-medium mb-2">Chú thích</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Đang chạy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-secondary" />
                <span className="text-xs text-muted-foreground">Đã chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Trễ</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
