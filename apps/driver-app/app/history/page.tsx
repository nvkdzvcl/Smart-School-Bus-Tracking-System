"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TripHistory {
  id: number
  date: string
  shift: string
  route: string
  startTime: string
  endTime: string
  totalStudents: number
  pickedUp: number
  droppedOff: number
  distance: string
  duration: string
  incidents: number
  status: "completed" | "incomplete"
}

export default function HistoryPage() {
  const router = useRouter()
  const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null)

  const [trips] = useState<TripHistory[]>([
    {
      id: 1,
      date: "2025-01-13",
      shift: "Ca sáng",
      route: "Tuyến A - Quận 1",
      startTime: "06:30",
      endTime: "07:45",
      totalStudents: 24,
      pickedUp: 24,
      droppedOff: 24,
      distance: "15.2 km",
      duration: "1h 15m",
      incidents: 0,
      status: "completed",
    },
    {
      id: 2,
      date: "2025-01-12",
      shift: "Ca chiều",
      route: "Tuyến A - Quận 1",
      startTime: "15:30",
      endTime: "16:50",
      totalStudents: 24,
      pickedUp: 24,
      droppedOff: 24,
      distance: "14.8 km",
      duration: "1h 20m",
      incidents: 1,
      status: "completed",
    },
    {
      id: 3,
      date: "2025-01-12",
      shift: "Ca sáng",
      route: "Tuyến A - Quận 1",
      startTime: "06:30",
      endTime: "07:40",
      totalStudents: 24,
      pickedUp: 24,
      droppedOff: 24,
      distance: "15.0 km",
      duration: "1h 10m",
      incidents: 0,
      status: "completed",
    },
    {
      id: 4,
      date: "2025-01-11",
      shift: "Ca chiều",
      route: "Tuyến A - Quận 1",
      startTime: "15:30",
      endTime: "16:45",
      totalStudents: 24,
      pickedUp: 23,
      droppedOff: 23,
      distance: "14.5 km",
      duration: "1h 15m",
      incidents: 0,
      status: "incomplete",
    },
  ])

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      router.push("/")
    }
  }, [router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="text-foreground hover:bg-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Lịch sử chuyến đi</h1>
              <p className="text-xs text-muted-foreground">30 ngày gần đây</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Summary Stats */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Tổng quan tháng này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{trips.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Chuyến đi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {trips.filter((t) => t.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Hoàn thành</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {trips.reduce((acc, t) => acc + t.incidents, 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Sự cố</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip List */}
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{formatDate(trip.date)}</h3>
                      <Badge
                        className={
                          trip.status === "completed"
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }
                      >
                        {trip.shift}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{trip.route}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      trip.status === "completed" ? "border-accent text-accent" : "border-destructive text-destructive"
                    }
                  >
                    {trip.status === "completed" ? "Hoàn thành" : "Chưa hoàn thành"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {trip.startTime} - {trip.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>
                      {trip.pickedUp}/{trip.totalStudents} học sinh
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span>{trip.distance}</span>
                  </div>
                </div>

                {trip.incidents > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span>{trip.incidents} sự cố được báo cáo</span>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedTrip?.id === trip.id && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Chi tiết chuyến đi</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tổng học sinh:</span>
                          <span className="text-foreground font-medium">{trip.totalStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Đã đón:</span>
                          <span className="text-foreground font-medium">{trip.pickedUp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Đã trả:</span>
                          <span className="text-foreground font-medium">{trip.droppedOff}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quãng đường:</span>
                          <span className="text-foreground font-medium">{trip.distance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Thời gian:</span>
                          <span className="text-foreground font-medium">{trip.duration}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert("Xuất báo cáo PDF")
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Xuất báo cáo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
