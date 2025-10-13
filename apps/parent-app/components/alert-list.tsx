import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, MapPin, Phone } from "lucide-react"

const alerts = [
  {
    id: 1,
    type: "delay",
    title: "Bus Delayed",
    description: "Bus is running 10 minutes late due to heavy traffic on Nguyen Van Linh Street.",
    time: "5 minutes ago",
    status: "active",
    action: "View on Map",
  },
  {
    id: 2,
    type: "resolved",
    title: "Route Deviation Resolved",
    description: "Bus has returned to normal route after temporary detour.",
    time: "2 hours ago",
    status: "resolved",
    action: null,
  },
]

export function AlertList() {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const isActive = alert.status === "active"

        return (
          <Card key={alert.id} className={isActive ? "border-warning bg-warning/5" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-warning/20" : "bg-muted"
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 ${isActive ? "text-warning" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{alert.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={isActive ? "destructive" : "secondary"}>{alert.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{alert.description}</p>

              {alert.action && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <MapPin className="w-4 h-4 mr-2" />
                    {alert.action}
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
