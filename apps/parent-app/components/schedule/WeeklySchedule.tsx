import {useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "../ui/Card.tsx"
import {Badge} from "../ui/Badge.tsx"
import {Button} from "../ui/Button.tsx"
import {
    ChevronLeft,
    ChevronRight,
    Sunrise,
    Sunset,
    Clock,
    MapPin,
    CheckCircle2,
    XCircle, MapIcon, Bus, Star
} from "lucide-react"

const weekDays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy"
]

function getDaysOfWeekFromString(dateString: string) {
    const date = new Date(dateString);

    return date.getDay();
}

const scheduleData = [
    {
        day: "Monday",
        morning: {time: "07:00 AM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: true},
        afternoon: {time: "04:30 PM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: true},
    },
    {
        day: "Tuesday",
        morning: {time: "07:00 AM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: true},
        afternoon: {time: "04:30 PM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: true},
    },
    {
        day: "Wednesday",
        morning: {time: "07:00 AM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: false},
        afternoon: {time: "04:30 PM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: false},
    },
    {
        day: "Thursday",
        morning: {time: "07:00 AM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: true},
        afternoon: {time: "04:30 PM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: false},
    },
    {
        day: "Friday",
        morning: {time: "07:00 AM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: false},
        afternoon: {time: "04:30 PM", pickup: "123 Nguyen Van Linh St.", status: "scheduled", isPresent: true},
    },
]

type TripStatus = "Scheduled" | "In_progress" | "Completed" | "Cancelled"
type TripType = "Pickup" | "Dropoff"

export default function WeeklySchedule() {
    const [currentWeek, setCurrentWeek] = useState(0)

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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Weekly Schedule</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="w-8 h-8"
                                onClick={() => setCurrentWeek(currentWeek - 1)}>
                            <ChevronLeft className="w-4 h-4"/>
                        </Button>
                        <span className="text-sm font-medium min-w-[100px] text-center">This Week</span>
                        <Button variant="ghost" size="icon" className="w-8 h-8"
                                onClick={() => setCurrentWeek(currentWeek + 1)}>
                            <ChevronRight className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {scheduleData.map((schedule, index) => (
                    <div key={schedule.day} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={index === getDaysOfWeekFromString(tripDate) ? "default" : "secondary"}
                                   className="w-12 justify-center">
                                {weekDays[index]}
                            </Badge>
                            <h4 className="text-sm font-semibold">{weekDays[index]}</h4>
                        </div>

                        <div className="grid gap-2 pl-14">
                            {tripSession === "Morning" ? (
                                <div
                                    className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                    <div
                                        className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Sunrise className="w-4 h-4 text-primary"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Morning {tripType}</p>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Bus className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{busLicensePlate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Bus className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{driverName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <MapIcon className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{routeName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Clock className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{actualStartTime}</span>
                                            <span className="font-semibold">{actualEndTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3"/>
                                            <span className="truncate">{pickupLocationName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Star className="w-3 h-3"/>
                                            <span className="truncate">{tripStatus}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {schedule.morning.isPresent ? (
                                                <>
                                                    <CheckCircle2 className="w-3 h-3 text-success"/>
                                                    <span className="truncate">Present</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 text-destructive"/>
                                                    <span className="truncate">Absent</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
                                    <div
                                        className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                        <Sunset className="w-4 h-4 text-accent"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Afternoon {tripType}</p>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Bus className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{busLicensePlate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Bus className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{driverName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <MapIcon className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{routeName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Clock className="w-3 h-3 text-muted-foreground"/>
                                            <span className="font-semibold">{actualStartTime}</span>
                                            <span className="font-semibold">{actualEndTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3"/>
                                            <span className="truncate">{dropoffLocationName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Star className="w-3 h-3"/>
                                            <span className="truncate">{tripStatus}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {schedule.afternoon.isPresent ? (
                                                <>
                                                    <CheckCircle2 className="w-3 h-3 text-success"/>
                                                    <span className="truncate">Present</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 text-destructive"/>
                                                    <span className="truncate">Absent</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
