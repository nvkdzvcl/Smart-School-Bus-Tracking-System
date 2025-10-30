import React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "../components/ui/Button"

interface TopBarProps {
  title: string
  showBack?: boolean
  showNotifications?: boolean
  showSettings?: boolean
  notificationCount?: number
}

export default function TopBar({
  title,
  showBack = false,
  // showNotifications = true,
  // showSettings = false,
  // notificationCount = 0,
}: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="w-9 h-9">
              <ChevronLeft className="w-5 h-5 dark:text-white" />
            </Button>
          )}
          <h1 className="text-lg font-semibold dark:text-white">{title}</h1>
        </div>

        {/* <div className="flex items-center gap-2">
          {showNotifications && (
            <Button variant="ghost" size="icon" className="relative w-9 h-9">
              <Bell className="w-5 h-5 dark:text-white" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}
          {showSettings && (
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div> */}
        <Button variant="destructive" className="h-8 w-24">
            Logout
        </Button>
      </div>
    </header>
  )
}
