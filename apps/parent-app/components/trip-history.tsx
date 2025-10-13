import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Bus, CheckCircle2, AlertCircle, Sunrise, Sunset } from "lucide-react"

const trips = [
  {
    id: 1,
    date: "Today",
    type: "Morning Pickup",
    icon: Sunrise,
    pickupTime: "07:05 AM",
    dropoffTime: "07:35 AM",
    location: "123 Nguyen Van Linh St.",
    bus: "51B-12345",
    driver: "Mr. Tran Van A",
    status: "completed",
    delay: 5,
  },
  {
    id: 2,
    date: "Yesterday",
    type: "Afternoon Dropoff",
    icon: Sunset,
    pickupTime: "04:30 PM",
    dropoffTime: "05:00 PM",
    location: "123 Nguyen Van Linh St.",
    bus: "51B-12345",
    driver: "Mr. Tran Van A",
    status: "completed",
    delay: 0,
  },
  {
    id: 3,
    date: "Yesterday",
    type: "Morning Pickup",
    icon: Sunrise,
    pickupTime: "07:00 AM",
    dropoffTime: "07:30 AM",
    location: "123 Nguyen Van Linh St.",
    bus: "51B-12345",
    driver: "Mr. Tran Van A",
    status: "completed",
    delay: 0,
  },
  {
    id: 4,
    date: "Dec 10",
    type: "Afternoon Dropoff",
    icon: Sunset,
    pickupTime: "04:35 PM",
    dropoffTime: "05:10 PM",
    location: "123 Nguyen Van Linh St.",
    bus: "51B-12345",
    driver: "Mr. Tran Van A",
    status: "delayed",
    delay: 15,
  },
]

export function TripHistory() {
  return (
    <div className="space-y-3">
      {trips.map((trip) => {
        const Icon = trip.icon
        const isDelayed = trip.status === "delayed"

        return (
          <Card key={trip.id} className={isDelayed ? "border-warning/30 bg-warning/5" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    trip.type.includes("Morning") ? "bg-primary/10" : "bg-accent/10"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${trip.type.includes("Morning") ? "text-primary" : "text-accent"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold">{trip.type}</h4>
                      <p className="text-xs text-muted-foreground">{trip.date}</p>
                    </div>
                    {isDelayed ? (
                      <Badge variant="destructive" className="shrink-0">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Delayed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0 bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        On Time
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Pickup:</span>
                      <span className="font-medium">{trip.pickupTime}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground">Arrival:</span>
                      <span className="font-medium">{trip.dropoffTime}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate text-muted-foreground">{trip.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Bus className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{trip.bus}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{trip.driver}</span>
                    </div>

                    {isDelayed && (
                      <div className="flex items-center gap-2 text-xs text-warning pt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-medium">Delayed by {trip.delay} minutes due to traffic</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
