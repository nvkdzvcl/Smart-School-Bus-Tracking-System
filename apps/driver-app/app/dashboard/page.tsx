"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ShiftData {
  shift: string
  route: string
  startTime: string
  vehicle: string
  totalStudents: number
  pickedUp: number
  remaining: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [driverName, setDriverName] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [shiftData] = useState<ShiftData>({
    shift: "Ca sáng",
    route: "Tuyến A - Quận 1",
    startTime: "06:30",
    vehicle: "Xe 01 - 51A-12345",
    totalStudents: 24,
    pickedUp: 0,
    remaining: 24,
  })

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      router.push("/")
      return
    }

    const name = localStorage.getItem("driver_name") || "Tài xế"
    setDriverName(name)

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleStartTrip = () => {
    router.push("/route")
  }

  const handleViewStudents = () => {
    router.push("/students")
  }

  const handleReportIncident = () => {
    router.push("/incidents")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Xin chào, {driverName}</h1>
              <p className="text-sm text-muted-foreground">{currentTime.toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary tabular-nums">
                {currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentTime.toLocaleTimeString("vi-VN", { second: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Current Shift Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Ca làm việc hôm nay</CardTitle>
              <Badge className="bg-primary text-primary-foreground">{shiftData.shift}</Badge>
            </div>
            <CardDescription className="text-muted-foreground">Thông tin chuyến đi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tuyến đường</p>
                <p className="text-sm font-medium text-foreground">{shiftData.route}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Thời gian bắt đầu</p>
                <p className="text-sm font-medium text-foreground">{shiftData.startTime}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground">Phương tiện</p>
                <p className="text-sm font-medium text-foreground">{shiftData.vehicle}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tiến độ đón học sinh</span>
                <span className="text-sm font-medium text-foreground">
                  {shiftData.pickedUp}/{shiftData.totalStudents}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(shiftData.pickedUp / shiftData.totalStudents) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-foreground">{shiftData.totalStudents}</div>
              <div className="text-xs text-muted-foreground mt-1">Tổng số</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{shiftData.pickedUp}</div>
              <div className="text-xs text-muted-foreground mt-1">Đã đón</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-accent">{shiftData.remaining}</div>
              <div className="text-xs text-muted-foreground mt-1">Còn lại</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleStartTrip}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Bắt đầu hành trình
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleViewStudents}
                variant="outline"
                className="h-12 border-border text-foreground hover:bg-muted bg-transparent"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Học sinh
              </Button>

              <Button
                onClick={handleReportIncident}
                variant="outline"
                className="h-12 border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Báo sự cố
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Thông báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Nhắc nhở ca làm việc</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ca sáng bắt đầu lúc 06:30. Vui lòng chuẩn bị sẵn sàng.
                </p>
                <p className="text-xs text-muted-foreground mt-1">5 phút trước</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Cập nhật tuyến đường</p>
                <p className="text-xs text-muted-foreground mt-1">Tuyến A có thay đổi nhỏ. Vui lòng kiểm tra bản đồ.</p>
                <p className="text-xs text-muted-foreground mt-1">1 giờ trước</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}
