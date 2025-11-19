import React from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "../ui/Card.tsx"
import { Calendar, Map, MessageSquare, User } from "lucide-react"

const actions = [
  {
    icon: Calendar,
    label: "Schedule",
    href: "/schedule",
    color: "text-success",
    bg: "bg-success/10",
  },
  // {
  //   icon: History,
  //   label: "History",
  //   href: "/history",
  //   color: "text-accent",
  //   bg: "bg-accent/10",
  // },
  {
    icon: Map,
    label: "Map",
    href: "/map",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    href: "/messages",
    color: "text-success",
    bg: "bg-success/10",
  },
  // {
  //   icon: AlertCircle,
  //   label: "Alerts",
  //   href: "/alerts",
  //   color: "text-warning",
  //   bg: "bg-warning/10",
  // },
  {
    icon: User,
    label: "Profile",
    href: "/profile",
    color: "text-success",
    bg: "bg-success/10",
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} to={action.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
