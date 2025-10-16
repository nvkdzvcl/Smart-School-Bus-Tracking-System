import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Button } from "../ui/Button"
import { UserPlus, MessageSquare, MapPin, Calendar, FileText, Settings } from "lucide-react"

const quickActions = [
  {
    title: "Gán tài xế",
    description: "Phân công tài xế thay thế",
    icon: UserPlus,
    href: "/assignments",
  },
  {
    title: "Gửi tin nhắn",
    description: "Thông báo cho phụ huynh",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    title: "Tạo tuyến mới",
    description: "Thêm tuyến xe buýt",
    icon: MapPin,
    href: "/schedules",
  },
  {
    title: "Lên lịch",
    description: "Quản lý lịch tuần",
    icon: Calendar,
    href: "/schedules",
  },
  {
    title: "Xuất báo cáo",
    description: "Tạo báo cáo mới",
    icon: FileText,
    href: "/reports",
  },
  {
    title: "Cài đặt",
    description: "Cấu hình hệ thống",
    icon: Settings,
    href: "/settings",
  },
]

export const QuickActions: React.FC = () => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Hành động nhanh</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4 bg-card hover:bg-muted"
                asChild
              >
                <a href={action.href}>
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </a>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
