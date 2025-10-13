import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { AlertTriangle, Clock, MessageSquare } from "lucide-react"
import { mockIncidents } from "../../../lib/mock-data"
import { getRelativeTime } from "../../../lib/utils/date"
import { incidentSeverityColors } from "../../../lib/utils/status"

export const RecentAlerts: React.FC = () => {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cảnh báo gần đây</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs">
            Xem tất cả
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {mockIncidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertTriangle className={`h-5 w-5 ${incidentSeverityColors[incident.severity]}`} />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {incident.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {incident.severity}
                  </Badge>
                </div>

                <p className="text-sm font-medium">{incident.description}</p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{getRelativeTime(incident.reportedAt)}</span>
                </div>
              </div>

              <Button size="sm" variant="outline" className="h-8 bg-transparent">
                <MessageSquare className="h-4 w-4 mr-1" />
                Xử lý
              </Button>
            </div>
          ))}

          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">Không có cảnh báo khác</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
