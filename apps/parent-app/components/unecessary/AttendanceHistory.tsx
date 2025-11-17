import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.tsx"
import { Badge } from "../ui/Badge.tsx"
import { CheckCircle2, XCircle, Calendar } from "lucide-react"

const attendance = [
  { date: "Dec 11, 2024", status: "present", morning: true, afternoon: true },
  { date: "Dec 10, 2024", status: "present", morning: true, afternoon: true },
  { date: "Dec 9, 2024", status: "present", morning: true, afternoon: true },
  { date: "Dec 8, 2024", status: "absent", morning: false, afternoon: false },
  { date: "Dec 7, 2024", status: "present", morning: true, afternoon: true },
]

export default function AttendanceHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Attendance</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {attendance.map((record) => (
            <div key={record.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    record.status === "present" ? "bg-success/10" : "bg-destructive/10"
                  }`}
                >
                  {record.status === "present" ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <p className="text-sm font-medium">{record.date}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        record.morning
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      AM: {record.morning ? "Present" : "Absent"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        record.afternoon
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      PM: {record.afternoon ? "Present" : "Absent"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
