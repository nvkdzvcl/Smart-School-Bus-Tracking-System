import {useState} from "react"
import {Card, CardContent} from "../ui/Card.tsx"
import {Badge} from "../ui/Badge.tsx"
import {Bus, User, ChevronUp, ChevronDown, MapIcon} from "lucide-react"

type TripStatus = "Scheduled" | "In_progress" | "Completed" | "Cancelled"
type TripType = "Pickup" | "Dropoff"

export default function TripInfoPanel() {
    const [routeName, setRouteName] = useState("Route 12A")
    const [busLicensePlate, setBusLicensePlate] = useState("51B-12345")
    const [driverName, setDriverName] = useState("Nguyen Van A")
    const [tripDate, setTripDate] = useState("2025-11-18T00:00:00.000Z")
    const [tripSession, setTripSession] = useState("Morning")
    const [tripType, setTripType] = useState<TripType>("Pickup")
    const [tripStatus, setTripStatus] = useState<TripStatus>("Scheduled")
    const [actualStartTime, setActualStartTime] = useState("2025-11-18T00:00:00.000Z")
    const [actualEndTime, setActualEndTime] = useState("2025-11-18T00:00:00.000Z")

    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="absolute bottom-0 left-0 right-0 z-10">
            <Card className="rounded-t-2xl rounded-b-none border-t shadow-2xl">
                {/* Handle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 flex justify-center hover:bg-muted/50 transition-colors"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground"/>
                    ) : (
                        <ChevronUp className="w-5 h-5 text-muted-foreground"/>
                    )}
                </button>

                <CardContent className="pb-6">
                    {/* Compact View */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Bus className="w-6 h-6 text-primary"/>
                                </div>
                                <div>
                                    <h3 className="font-semibold">{busLicensePlate}</h3>
                                    <p className="text-sm text-muted-foreground">{routeName}</p>
                                </div>
                            </div>
                            <Badge>{tripStatus}</Badge>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="space-y-4 pt-2 border-t">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapIcon className="w-4 h-4 text-muted-foreground"/>
                                            <span className="text-muted-foreground">Trip Information:</span>
                                        </div>
                                        <p className="font-medium pl-6">Session: {tripSession}</p>
                                        <p className="font-medium pl-6">Date: {tripDate}</p>
                                        <p className="font-medium pl-6">Time: {actualStartTime}</p>
                                        <p className="font-medium pl-6">Type: {tripType}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-muted-foreground"/>
                                            <span className="text-muted-foreground">Driver:</span>
                                        </div>
                                        <p className="font-medium pl-6">{driverName}</p>
                                    </div>

                                    {/* <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">ETA:</span>
                    </div>
                    <p className="font-semibold text-accent pl-6">5 minutes</p>
                  </div> */}
                                </div>

                                {/* <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next Stop:</span>
                  </div>
                  <p className="font-medium pl-6">123 Nguyen Van Linh St.</p>
                </div> */}

                                {/* <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Driver
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                </div> */}

                                {/* Route Progress */}
                                <div className="space-y-2 pt-2 border-t">
                                    <p className="text-sm font-medium">Route Progress</p>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-success"/>
                                                <div className="w-0.5 h-8 bg-border"/>
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <p className="text-sm font-medium">School Departure</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"/>
                                                <div className="w-0.5 h-8 bg-border"/>
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <p className="text-sm font-medium">Your Stop</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-muted"/>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-muted-foreground">Final Stop</p>
                                                <p className="text-xs text-muted-foreground">{actualEndTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
