import React from "react"
import { NavLink } from "react-router-dom"
import { Home, Map, Calendar, MessageSquare, User } from "lucide-react"
import { cn } from "../lib/utils/Utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/tracking", icon: Map, label: "Map" },
  { href: "/schedule", icon: Calendar, label: "Schedule" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
