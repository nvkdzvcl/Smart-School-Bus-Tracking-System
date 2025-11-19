import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.tsx"
import { Badge } from "../../../components/ui/Badge.tsx"
import { Button } from "../../../components/ui/Button.tsx"
import {Bus, MapPin, User, Navigation, Clock, Calendar, Star} from "lucide-react"
import { Link } from "react-router-dom"
import {useState} from "react";
import {format} from "date-fns";

type TripStatus = "Scheduled" | "In_progress" | "Completed" | "Cancelled"
type TripType = "Pickup" | "Dropoff"

export default function TripStatusCard() {
    const [routeName, setRouteName] = useState("Route 12A")
    const [busLicensePlate, setBusLicensePlate] = useState("51B-12345")
    const [driverName, setDriverName] = useState("Nguyen Van A")
    const [tripDate, setTripDate] = useState("2025-11-18T00:00:00.000Z")
    const [tripSession, setTripSession] = useState("Morning")
    const [tripType, setTripType] = useState<TripType>("Pickup")
    const [tripStatus, setTripStatus] = useState<TripStatus>("Scheduled")
    const [actualStartTime, setActualStartTime] = useState("2025-11-18T00:00:00.000Z")
    const [actualEndTime, setActualEndTime] = useState("2025-11-18T00:00:00.000Z")

    const [pickupLocationName, setPickupLocationName] = useState("123 Nguyen Van Linh")
    const [dropoffLocationName, setDropoffLocationName] = useState("Dai Hoc Sai Gon")

    const currentTripStatus: TripStatus = "In_progress"
    const getTripStatusConfig = (status: TripStatus) => {
        switch (status) {
            case "Scheduled":
                return {
                    badge: "Scheduled",
                    badgeVariant: "default" as const,
                    bgColor: "bg-primary/5",
                    message: "Trip is scheduled",
                }
            case "In_progress":
                return {
                    badge: "In Progress",
                    badgeVariant: "default" as const,
                    bgColor: "bg-success/5",
                    message: "Bus has arrived at school",
                }
            case "Completed":
                return {
                    badge: "Completed",
                    badgeVariant: "default" as const,
                    bgColor: "bg-success/5",
                    message: "Trip is completed",
                }
            case "Cancelled":
                return {
                    badge: "Cancelled",
                    badgeVariant: "destructive" as const,
                    bgColor: "bg-destructive/5",
                    message: "Trip is cancelled",
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

    const config = getTripStatusConfig(currentTripStatus)

    return (
        <Card className={config.bgColor}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Trip Status</CardTitle>
                            <p className="text-sm text-muted-foreground">{routeName}</p>
                        </div>
                    </div>
                    <Badge variant={config.badgeVariant}>{config.badge}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
                <p className="text-sm font-medium">{config.message}</p>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <Star className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium truncate">{tripType}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium truncate">{format(tripDate, "dd/MM/yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium truncate">{format(actualStartTime, "dd/MM/yyyy")} - {format(actualEndTime, "dd/MM/yyyy")}</span>
                    </div>
                    {tripType === "Pickup" ? (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Pickup:</span>
                            <span className="font-medium truncate">{pickupLocationName}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Dropoff:</span>
                            <span className="font-medium truncate">{dropoffLocationName}</span>
                        </div>
                    )}


                    <div className="flex items-center gap-3 text-sm">
                        <Bus className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Bus:</span>
                        <span className="font-medium">{busLicensePlate}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Driver:</span>
                        <span className="font-medium">{driverName}</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1" size="lg">
                        <Link to="/tracking">
                            <Navigation className="w-4 h-4 mr-2" />
                            Track Bus
                        </Link>
                    </Button>
                    {/* <Button variant="outline" size="lg" className="flex-1 bg-transparent">
            <Phone className="w-4 h-4 mr-2" />
            Call Support
          </Button> */}
                </div>
            </CardContent>
        </Card>
    )
}
