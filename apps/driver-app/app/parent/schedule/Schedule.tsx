import { useState, useMemo } from "react"

// Nếu bạn dùng alias "@", đổi các import dưới về "@/components/..."
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { ParentNav } from "../../components/ParentNav"

import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

export default function ParentSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Helper: format YYYY-MM-DD theo giờ địa phương (không lệch UTC)
  const formatLocalYMD = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  // Tạo 7 ngày quanh selectedDate (-3 .. +3)
  const weekDays = useMemo(() => {
    const start = new Date(selectedDate)
    start.setDate(selectedDate.getDate() - 3)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [selectedDate])

  // Mock data
  const scheduleData = [
    {
      date: "2025-01-13",
      morning: { time: "07:15", pickup: "123 Nguyễn Văn Linh", bus: "51B-12345", driver: "Trần Văn Bình" },
      afternoon: { time: "16:30", dropoff: "123 Nguyễn Văn Linh", bus: "51B-12345", driver: "Trần Văn Bình" },
      status: "active",
    },
    {
      date: "2025-01-14",
      morning: { time: "07:15", pickup: "123 Nguyễn Văn Linh", bus: "51B-12345", driver: "Trần Văn Bình" },
      afternoon: { time: "16:30", dropoff: "123 Nguyễn Văn Linh", bus: "51B-12345", driver: "Trần Văn Bình" },
      status: "scheduled",
    },
    {
      date: "2025-01-15",
      morning: { time: "07:15", pickup: "123 Nguyễn Văn Linh", bus: "51B-12345", driver: "Trần Văn Bình" },
      afternoon: { time: "16:30", dropoff: "123 Nguyễn Văn Linh", bus: "51B-12345", driver: "Trần Văn Bình" },
      status: "scheduled",
    },
  ]

  const todayKey = formatLocalYMD(selectedDate)
  const todaySchedule = scheduleData.find((s) => s.date === todayKey)

  const goPrevWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(selectedDate.getDate() - 7)
    setSelectedDate(d)
  }

  const goNextWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(selectedDate.getDate() + 7)
    setSelectedDate(d)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Lịch trình</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Week Calendar */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={goPrevWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold text-foreground">
                Tháng {selectedDate.getMonth() + 1}, {selectedDate.getFullYear()}
              </h3>
              <Button variant="ghost" size="sm" onClick={goNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const isSelected = date.toDateString() === selectedDate.toDateString()
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <button
                    key={date.getTime()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                        ? "bg-accent/20 text-accent"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="text-xs font-medium">
                      {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-bold">{date.getDate()}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        {todaySchedule ? (
          <>
            {/* Morning */}
            <Card className="border-0 shadow-md">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <h3 className="font-semibold">Buổi sáng - Đón</h3>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian đón</p>
                    <p className="text-lg font-bold text-foreground">{todaySchedule.morning.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Điểm đón</p>
                    <p className="text-sm font-medium text-foreground">{todaySchedule.morning.pickup}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Xe</span>
                    <Badge variant="outline" className="font-mono">
                      {todaySchedule.morning.bus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tài xế</span>
                    <span className="text-sm font-medium text-foreground">{todaySchedule.morning.driver}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Afternoon */}
            <Card className="border-0 shadow-md">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <h3 className="font-semibold">Buổi chiều - Trả</h3>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian trả</p>
                    <p className="text-lg font-bold text-foreground">{todaySchedule.afternoon.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Điểm trả</p>
                    <p className="text-sm font-medium text-foreground">{todaySchedule.afternoon.dropoff}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Xe</span>
                    <Badge variant="outline" className="font-mono">
                      {todaySchedule.afternoon.bus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tài xế</span>
                    <span className="text-sm font-medium text-foreground">{todaySchedule.afternoon.driver}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Absence */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Đăng ký nghỉ</h3>
                    <p className="text-sm text-muted-foreground">
                      Nếu con bạn không đi học, vui lòng thông báo trước để tài xế biết.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Đăng ký nghỉ hôm nay
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Không có lịch trình cho ngày này</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Gộp ParentNav từ Layout.tsx */}
      <ParentNav />
    </div>
  )
}
