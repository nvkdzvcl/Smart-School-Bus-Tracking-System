import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Clock, MapPin, User } from "lucide-react"
import { mockRoutes, mockStops, mockVehicles, mockDrivers } from "../../lib/mock-data"

export const UpcomingStops: React.FC = () => {
  const upcomingStops = [
    {
      route: mockRoutes[0],
      stop: mockStops[0],
      vehicle: mockVehicles[0],
      driver: mockDrivers[0],
      eta: "5 phút",
      studentsCount: 8,
    },
    {
      route: mockRoutes[1],
      stop: mockStops[3],
      vehicle: mockVehicles[1],
      driver: mockDrivers[1],
      eta: "12 phút",
      studentsCount: 12,
    },
    {
      route: mockRoutes[0],
      stop: mockStops[1],
      vehicle: mockVehicles[0],
      driver: mockDrivers[0],
      eta: "18 phút",
      studentsCount: 5,
    },
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Sắp đến điểm đón</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {upcomingStops.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.route.code}
                  </Badge>
                  <span className="text-sm font-medium">{item.vehicle.plateNumber}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{item.stop.name}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{item.driver.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{item.studentsCount} học sinh</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge className="bg-secondary text-secondary-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.eta}
                </Badge>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  Chi tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
