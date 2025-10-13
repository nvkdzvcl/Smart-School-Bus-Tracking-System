"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, Calendar, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/parent/home", icon: Home, label: "Trang chủ" },
  { href: "/parent/tracking", icon: MapPin, label: "Bản đồ" },
  { href: "/parent/schedule", icon: Calendar, label: "Lịch trình" },
  { href: "/parent/messages", icon: MessageSquare, label: "Tin nhắn" },
  { href: "/parent/profile", icon: User, label: "Hồ sơ" },
]

export function ParentNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
