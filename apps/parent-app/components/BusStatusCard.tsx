import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Bus, MapPin, Clock, Phone, Navigation } from "lucide-react"
import { Link } from "react-router-dom"

export default function BusStatusCard() {
  type BusStatus = "on-route" | "arrived" | "delayed" | "idle"
  //const status = "on-route" // "on-route" | "arrived" | "delayed" | "idle"
  const eta = "5 minutes"

  const getStatusConfig = (status: BusStatus) => {
    switch (status) {
      case "on-route":
        return {
          badge: "On Route",
          badgeVariant: "default" as const,
          bgColor: "bg-primary/5",
          message: "Bus is on the way to pickup point",
        }
      case "arrived":
        return {
          badge: "Arrived",
          badgeVariant: "default" as const,
          bgColor: "bg-success/5",
          message: "Bus has arrived at school",
        }
      case "delayed":
        return {
          badge: "Delayed",
          badgeVariant: "destructive" as const,
          bgColor: "bg-destructive/5",
          message: "Bus is running 10 minutes late",
        }
      default:
        return {
          badge: "Idle",
          badgeVariant: "secondary" as const,
          bgColor: "bg-muted",
          message: "No active trip",
        }
    }
  }

  const currentStatus: BusStatus = "on-route"
  const config = getStatusConfig(currentStatus)

  return (
    <Card className={config.bgColor}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Bus Status</CardTitle>
              <p className="text-sm text-muted-foreground">Route 12A - Morning</p>
            </div>
          </div>
          <Badge variant={config.badgeVariant}>{config.badge}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm font-medium">{config.message}</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">ETA:</span>
            <span className="font-semibold text-accent">{eta}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Pickup:</span>
            <span className="font-medium truncate">123 Nguyen Van Linh St.</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Bus className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Bus:</span>
            <span className="font-medium">51B-12345</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Driver:</span>
            <span className="font-medium">Mr. Tran Van A</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1" size="lg">
            <Link to="/tracking">
              <Navigation className="w-4 h-4 mr-2" />
              Track Bus
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="flex-1 bg-transparent">
            <Phone className="w-4 h-4 mr-2" />
            Call Support
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
