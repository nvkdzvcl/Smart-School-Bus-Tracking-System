import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { cn } from "../../lib/Utils"

interface CalendarEvent {
  id: string
  routeCode: string
  vehiclePlate: string
  driverName: string
  shift: "morning" | "afternoon"
  status: "confirmed" | "pending" | "conflict"
}

const mockEvents: Record<string, CalendarEvent[]> = {
  "2025-01-13": [
    { id: "1", routeCode: "DD-01", vehiclePlate: "29A-12345", driverName: "Nguyễn Văn An", shift: "morning", status: "confirmed" },
    { id: "2", routeCode: "HM-02", vehiclePlate: "30B-67890", driverName: "Trần Minh Tuấn", shift: "morning", status: "confirmed" },
  ],
  "2025-01-14": [
    { id: "3", routeCode: "DD-01", vehiclePlate: "29A-12345", driverName: "Nguyễn Văn An", shift: "morning", status: "pending" },
  ],
}

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 13))
  const [view, setView] = useState<"week" | "month">("week")

  const daysInWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - date.getDay() + i)
    return date
  })

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lịch tuần</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setView(view === "week" ? "month" : "week")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {view === "week" ? "Xem tháng" : "Xem tuần"}
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Hôm nay
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek("next")} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Day cells */}
          {daysInWeek.map((date) => {
            const dateKey = date.toISOString().split("T")[0]
            const events = mockEvents[dateKey] || []
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-[120px] p-2 rounded-lg border border-border bg-card",
                  isToday && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-medium", isToday && "text-primary")}>{date.getDate()}</span>
                  {events.length > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      {events.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      className={cn(
                        "w-full text-left p-2 rounded text-xs transition-colors",
                        event.status === "confirmed" && "bg-primary/10 hover:bg-primary/20",
                        event.status === "pending" && "bg-secondary/10 hover:bg-secondary/20",
                        event.status === "conflict" && "bg-destructive/10 hover:bg-destructive/20",
                      )}
                    >
                      <p className="font-medium truncate">{event.routeCode}</p>
                      <p className="text-muted-foreground truncate">{event.vehiclePlate}</p>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
