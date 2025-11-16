import React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Bell } from "lucide-react"
import { Badge } from "../components/ui/Badge"
import { Settings } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu"

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
  showSettings = true,
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

        <div className="flex items-center gap-2">
          {/* {showNotifications && (
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
          )} */}
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 dark:text-white" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  5
                </Badge>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" className="w-80">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">Xe 29A-12345 trễ 10 phút</span>
                </div>
                <span className="text-xs text-muted-foreground ml-4">5 phút trước</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <span className="text-sm font-medium">Tài xế Nguyễn Văn An đã check-in</span>
                </div>
                <span className="text-xs text-muted-foreground ml-4">15 phút trước</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <span className="text-sm font-medium">Báo cáo tuần đã sẵn sàng</span>
                </div>
                <span className="text-xs text-muted-foreground ml-4">1 giờ trước</span>
              </DropdownMenuItem>

                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-muted" />
                        <span className="text-sm font-medium">Báo cáo tuần đã sẵn sàng</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4">1 giờ trước</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-muted" />
                        <span className="text-sm font-medium">Báo cáo tuần đã sẵn sàng</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4">1 giờ trước</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {showSettings && (
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Settings className="w-5 h-5 dark:text-white" onClick={() => navigate("/settings")} />
            </Button>
          )}
        </div>
        {/* <Button variant="destructive" className="h-8 w-24">
            Logout
        </Button> */}
      </div>
    </header>
  )
}
