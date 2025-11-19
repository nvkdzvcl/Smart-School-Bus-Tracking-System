import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.tsx"
import { Badge } from "../ui/Badge.tsx"
import { Clock, MapPin, Sunrise, Sunset } from "lucide-react"

const trips = [
  {
    id: 1,
    type: "Morning Pickup",
    time: "07:00 AM",
    location: "123 Nguyen Van Linh St.",
    status: "scheduled",
    icon: Sunrise,
  },
  {
    id: 2,
    type: "Afternoon Dropoff",
    time: "04:30 PM",
    location: "123 Nguyen Van Linh St.",
    status: "scheduled",
    icon: Sunset,
  },
]

export default function UpcomingTrips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trips.map((trip) => {
          const Icon = trip.icon
          return (
            <div key={trip.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">{trip.type}</h4>
                  <Badge variant="secondary" className="text-xs">
                    Scheduled
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{trip.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{trip.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
