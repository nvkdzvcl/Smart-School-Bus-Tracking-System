import React from "react"
import { Card, CardContent } from "../ui/Card.tsx"
import { Bell, MessageSquare, AlertTriangle, Info } from "lucide-react"

const messages = [
  {
    id: 1,
    type: "alert",
    icon: AlertTriangle,
    title: "Bus Delayed",
    message: "Bus is running 10 minutes late due to traffic on Nguyen Van Linh St.",
    time: "5 min ago",
    unread: true,
    color: "warning",
  },
  {
    id: 2,
    type: "notification",
    icon: Bell,
    title: "Bus Approaching",
    message: "Bus is 500m away from your pickup point. Please be ready.",
    time: "15 min ago",
    unread: true,
    color: "primary",
  },
  {
    id: 3,
    type: "message",
    icon: MessageSquare,
    title: "Message from School",
    message: "Reminder: Parent-teacher meeting scheduled for next Friday at 2 PM.",
    time: "2 hours ago",
    unread: false,
    color: "accent",
  },
  {
    id: 4,
    type: "info",
    icon: Info,
    title: "Route Change Notice",
    message: "Temporary route change tomorrow due to road construction. New pickup time: 7:15 AM.",
    time: "Yesterday",
    unread: false,
    color: "primary",
  },
]

export default function MessageList() {
  return (
    // <div className="divide-y divide-border">
    <div className="space-y-3 max-w-2xl mx-auto p-4">
      {messages.map((message) => {
        const Icon = message.icon
        const bgColor =
          message.color === "warning" ? "bg-warning/10" : message.color === "accent" ? "bg-accent/10" : "bg-primary/10"
        const textColor =
          message.color === "warning" ? "text-warning" : message.color === "accent" ? "text-accent" : "text-primary"

        return (
          // <Card key={message.id} className="rounded-none border-0 border-b last:border-b-0">
          <Card key={message.id}>
            <CardContent className={`p-4 ${message.unread ? "bg-muted/30" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${textColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold">{message.title}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      {message.unread && <div className="w-2 h-2 rounded-full bg-primary" />}
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{message.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
