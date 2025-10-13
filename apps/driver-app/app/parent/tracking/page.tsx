"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Navigation,
  Clock,
  RefreshCw,
  Phone,
  AlertCircle,
  CheckCircle2,
  Circle,
  Home,
  School,
} from "lucide-react"

export default function ParentTrackingPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Mock data
  const busLocation = {
    lat: 10.7769,
    lng: 106.7009,
    speed: 35,
    heading: 45,
  }

  const route = {
    stops: [
      { id: 1, name: "Điểm đón: 123 Nguyễn Văn Linh", status: "completed", time: "07:15", eta: null },
      { id: 2, name: "Điểm đón: 456 Lê Văn Việt", status: "completed", time: "07:25", eta: null },
      { id: 3, name: "Điểm đón: 789 Võ Văn Ngân", status: "current", time: "07:35", eta: "5 phút" },
      { id: 4, name: "Trường Tiểu học ABC", status: "upcoming", time: "07:50", eta: "20 phút" },
    ],
  }

  const tripInfo = {
    driver: "Trần Văn Bình",
    phone: "0912-345-678",
    licensePlate: "51B-12345",
    studentsOnBoard: 12,
    totalStudents: 15,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Theo dõi xe</h1>
              <p className="text-sm text-muted-foreground">Cập nhật: {currentTime.toLocaleTimeString("vi-VN")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Map Placeholder */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="relative h-[300px] bg-gradient-to-br from-blue-100 to-green-100">
            {/* Simulated map with route */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Route line */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                  <path
                    d="M 50 250 Q 150 200, 250 150 T 450 50"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                </svg>

                {/* Stops */}
                <div
                  className="absolute top-[250px] left-[50px] -translate-x-1/2 -translate-y-1/2"
                  style={{ zIndex: 2 }}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div
                  className="absolute top-[50px] right-[50px] -translate-x-1/2 -translate-y-1/2"
                  style={{ zIndex: 2 }}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <School className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Current bus location */}
                <div
                  className="absolute top-[150px] left-[250px] -translate-x-1/2 -translate-y-1/2"
                  style={{ zIndex: 3 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                      <Navigation className="w-6 h-6 text-white" style={{ transform: "rotate(45deg)" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Speed indicator */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{busLocation.speed} km/h</span>
              </div>
            </div>

            {/* Open in Google Maps */}
            <div className="absolute bottom-4 right-4">
              <Button
                size="sm"
                className="bg-white/95 backdrop-blur-sm text-foreground hover:bg-white shadow-md"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${busLocation.lat},${busLocation.lng}`,
                    "_blank",
                  )
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Mở Google Maps
              </Button>
            </div>
          </div>
        </Card>

        {/* Trip Info */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{tripInfo.driver}</p>
                  <Badge variant="outline" className="font-mono text-xs">
                    {tripInfo.licensePlate}
                  </Badge>
                </div>
              </div>
              <a href={`tel:${tripInfo.phone}`}>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Phone className="w-4 h-4" />
                  Gọi
                </Button>
              </a>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Học sinh trên xe</span>
                <span className="font-semibold text-foreground">
                  {tripInfo.studentsOnBoard}/{tripInfo.totalStudents}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Progress */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Lộ trình chi tiết</h3>
            <div className="space-y-4">
              {route.stops.map((stop, index) => (
                <div key={stop.id} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stop.status === "completed"
                          ? "bg-green-500"
                          : stop.status === "current"
                            ? "bg-primary"
                            : "bg-muted"
                      }`}
                    >
                      {stop.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : stop.status === "current" ? (
                        <Navigation className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {index < route.stops.length - 1 && (
                      <div className={`w-0.5 h-12 ${stop.status === "completed" ? "bg-green-500" : "bg-muted"}`} />
                    )}
                  </div>

                  {/* Stop info */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-medium ${stop.status === "current" ? "text-primary" : "text-foreground"}`}>
                          {stop.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stop.status === "completed"
                            ? `Đã qua lúc ${stop.time}`
                            : stop.status === "current"
                              ? "Đang tại đây"
                              : `Dự kiến ${stop.time}`}
                        </p>
                      </div>
                      {stop.eta && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {stop.eta}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-md bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Xe sắp đến điểm đón của bạn</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Xe dự kiến đến trong 5 phút. Vui lòng chuẩn bị sẵn sàng.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
