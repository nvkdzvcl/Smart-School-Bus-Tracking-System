import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Plus, Search, MapPin, Clock, Users } from "lucide-react"
import { mockRoutes } from "../../lib/mock-data"
import { routeStatusLabels, routeStatusColors } from "../../lib/utils/status"
import { cn } from "../../lib/utils"

interface RouteListProps {
  onSelectRoute: (routeId: string) => void
  onCreateRoute: () => void
}

export const RouteList: React.FC<RouteListProps> = ({ onSelectRoute, onCreateRoute }) => {
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Danh sách tuyến</CardTitle>
          <Button size="sm" onClick={onCreateRoute}>
            <Plus className="h-4 w-4 mr-1" />
            Tạo mới
          </Button>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm tuyến..." className="pl-9 h-9" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-2 p-4 pt-0">
            {mockRoutes.map((route) => (
              <button
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {route.code}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", routeStatusColors[route.status])}>
                        {routeStatusLabels[route.status]}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{route.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{route.stops.length} điểm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{route.estimatedDuration} phút</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{route.distance} km</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
