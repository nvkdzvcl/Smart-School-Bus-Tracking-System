import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

// Nếu bạn đang dùng alias "@", đổi các import dưới lại "@/components/..."
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { ParentNav } from "../../components/ParentNav"

import {
  MapPin,
  Calendar,
  Bell,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle,
  Navigation,
} from "lucide-react"

export default function ParentHomePage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock data
  const student = {
    name: "Nguyễn Minh An",
    class: "Lớp 3A",
    photo: "/diverse-students-studying.png",
    pickupPoint: "123 Nguyễn Văn Linh, Q.7",
  }

  const busStatus = {
    status: "moving_to_pickup" as
      | "moving_to_pickup"
      | "at_school"
      | "moving_home"
      | "delayed"
      | "incident",
    message: "Xe đang di chuyển đến điểm đón",
    eta: "5 phút",
    distance: "1.2 km",
  }

  const bus = {
    licensePlate: "51B-12345",
    photo: "/school-bus.jpg",
    driver: "Trần Văn Bình",
    phone: "0912-345-678",
  }

  const notifications = [
    { id: 1, message: "Xe sắp đến điểm đón trong 5 phút", time: "2 phút trước", unread: true },
    { id: 2, message: "Con đã lên xe an toàn", time: "30 phút trước", unread: false },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving_to_pickup":
        return "bg-blue-500"
      case "at_school":
        return "bg-green-500"
      case "moving_home":
        return "bg-blue-500"
      case "delayed":
        return "bg-orange-500"
      case "incident":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "at_school":
        return <CheckCircle className="w-5 h-5" />
      case "delayed":
      case "incident":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Navigation className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Trang chủ</h1>
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {currentTime.toLocaleTimeString("vi-VN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Student Info Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={student.photo || "/placeholder.svg"}
                alt={student.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
                <p className="text-sm text-muted-foreground mb-2">{student.class}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{student.pickupPoint}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bus Status Card */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className={`${getStatusColor(busStatus.status)} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(busStatus.status)}
                <div>
                  <p className="font-semibold">{busStatus.message}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm opacity-90">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ETA: {busStatus.eta}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {busStatus.distance}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <img
                src={bus.photo || "/placeholder.svg"}
                alt="School Bus"
                className="w-24 h-16 rounded-lg object-cover border border-border"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono">
                    {bus.licensePlate}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Tài xế: {bus.driver}</p>
                <a
                  href={`tel:${bus.phone}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  <Phone className="w-3 h-3" />
                  {bus.phone}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/parent/tracking" className="block">
            <Button
              variant="outline"
              className="relative w-full h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary bg-transparent"
            >
              <MapPin className="w-6 h-6 text-primary" />
              <span className="text-xs font-medium">Xem bản đồ</span>
            </Button>
          </Link>

          <Link to="/parent/schedule" className="block">
            <Button
              variant="outline"
              className="relative w-full h-auto flex-col gap-2 py-4 hover:bg-accent/5 hover:border-accent bg-transparent"
            >
              <Calendar className="w-6 h-6 text-accent" />
              <span className="text-xs font-medium">Lịch hôm nay</span>
            </Button>
          </Link>

          <Link to="/parent/messages" className="block">
            <Button
              variant="outline"
              className="relative w-full h-auto flex-col gap-2 py-4 hover:bg-orange-500/5 hover:border-orange-500 bg-transparent"
            >
              <Bell className="w-6 h-6 text-orange-500" />
              <span className="text-xs font-medium">Thông báo</span>
              {notifications.some((n) => n.unread) && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                  {notifications.filter((n) => n.unread).length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        {/* Recent Notifications */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Thông báo gần đây</h3>
              <Link to="/parent/messages" className="text-sm text-primary hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    notification.unread ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                  }`}
                >
                  <Bell
                    className={`w-4 h-4 mt-0.5 ${
                      notification.unread ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        notification.unread ? "font-medium text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Mẹo an toàn</h3>
                <p className="text-sm text-muted-foreground">
                  Hãy chuẩn bị sẵn sàng khi xe sắp đến. Đảm bảo con bạn có đủ đồ dùng cần thiết và đã ăn sáng đầy đủ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Gộp ParentNav từ Layout.tsx */}
      <ParentNav />
    </div>
  )
}
