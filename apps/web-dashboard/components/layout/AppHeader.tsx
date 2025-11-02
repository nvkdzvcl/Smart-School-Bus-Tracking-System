import React from "react"
import { Bell, Search } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu"
import { Badge } from "../ui/Badge"

interface AppHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, description, actions }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Title */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm..." className="pl-9" />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 " />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
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
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Actions */}
        {actions}
      </div>
    </header>
  )
}
