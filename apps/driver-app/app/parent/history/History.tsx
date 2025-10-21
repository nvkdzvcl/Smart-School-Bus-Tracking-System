import { useState } from "react"

import { Card, CardContent } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Badge } from "../../../components/ui/Badge"
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs"
import { ParentNav } from "../../../components/ParentNav"
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Download, Calendar, TrendingUp } from "lucide-react"

export default function ParentHistoryPage() {
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  // Mock data
  const tripHistory = [
    {
      id: 1,
      date: "2025-01-13",
      morning: { pickupTime: "07:15", arrivalTime: "07:45", status: "completed", delay: 0, driver: "Trần Văn Bình", bus: "51B-12345" },
      afternoon:{ pickupTime: "16:30", arrivalTime: "17:00", status: "completed", delay: 0, driver: "Trần Văn Bình", bus: "51B-12345" },
      incidents: [],
    },
    {
      id: 2,
      date: "2025-01-12",
      morning: { pickupTime: "07:20", arrivalTime: "07:55", status: "completed", delay: 5, driver: "Trần Văn Bình", bus: "51B-12345" },
      afternoon:{ pickupTime: "16:35", arrivalTime: "17:10", status: "completed", delay: 5, driver: "Trần Văn Bình", bus: "51B-12345" },
      incidents: [{ type: "traffic", message: "Kẹt xe đường Nguyễn Văn Linh" }],
    },
    {
      id: 3,
      date: "2025-01-11",
      morning: { pickupTime: "-", arrivalTime: "-", status: "absent", delay: 0, driver: "-", bus: "-" },
      afternoon:{ pickupTime: "-", arrivalTime: "-", status: "absent", delay: 0, driver: "-", bus: "-" },
      incidents: [],
    },
    {
      id: 4,
      date: "2025-01-10",
      morning: { pickupTime: "07:18", arrivalTime: "07:48", status: "completed", delay: 0, driver: "Trần Văn Bình", bus: "51B-12345" },
      afternoon:{ pickupTime: "16:32", arrivalTime: "17:02", status: "completed", delay: 0, driver: "Trần Văn Bình", bus: "51B-12345" },
      incidents: [],
    },
  ]

  const stats = { totalTrips: 40, onTime: 35, delayed: 5, avgDelay: 3 }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Lịch sử chuyến đi</h1>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Tuần này</TabsTrigger>
            <TabsTrigger value="month">Tháng này</TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalTrips}</p>
                  <p className="text-xs text-muted-foreground">Tổng chuyến</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.onTime}</p>
                  <p className="text-xs text-muted-foreground">Đúng giờ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.delayed}</p>
                  <p className="text-xs text-muted-foreground">Trễ giờ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.avgDelay}m</p>
                  <p className="text-xs text-muted-foreground">TB trễ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trip History List */}
        <div className="space-y-3">
          {tripHistory.map((trip) => (
            <Card key={trip.id} className="border-0 shadow-md">
              <CardContent className="p-0">
                {/* Trip Header */}
                <button
                  onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trip.morning.status === "absent"
                          ? "bg-gray-500/10"
                          : trip.incidents.length > 0
                          ? "bg-orange-500/10"
                          : "bg-green-500/10"
                      }`}
                    >
                      {trip.morning.status === "absent" ? (
                        <Calendar className="w-5 h-5 text-gray-500" />
                      ) : trip.incidents.length > 0 ? (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">
                        {new Date(trip.date).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trip.morning.status === "absent"
                          ? "Nghỉ học"
                          : trip.incidents.length > 0
                          ? `${trip.incidents.length} sự cố`
                          : "Hoàn thành"}
                      </p>
                    </div>
                  </div>
                  {expandedTrip === trip.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded Details */}
                {expandedTrip === trip.id && trip.morning.status !== "absent" && (
                  <div className="px-4 pb-4 space-y-4 border-top border-border pt-4">
                    {/* Morning Trip */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">Buổi sáng</Badge>
                        {trip.morning.delay > 0 && (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-700">
                            Trễ {trip.morning.delay} phút
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Đón lúc</span>
                          <span className="font-medium text-foreground">{trip.morning.pickupTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Đến trường</span>
                          <span className="font-medium text-foreground">{trip.morning.arrivalTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tài xế</span>
                          <span className="font-medium text-foreground">{trip.morning.driver}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Xe</span>
                          <Badge variant="outline" className="font-mono text-xs">{trip.morning.bus}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Afternoon Trip */}
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700">Buổi chiều</Badge>
                        {trip.afternoon.delay > 0 && (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-700">
                            Trễ {trip.afternoon.delay} phút
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Đón lúc</span>
                          <span className="font-medium text-foreground">{trip.afternoon.pickupTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Về đến nhà</span>
                          <span className="font-medium text-foreground">{trip.afternoon.arrivalTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tài xế</span>
                          <span className="font-medium text-foreground">{trip.afternoon.driver}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Xe</span>
                          <Badge variant="outline" className="font-mono text-xs">{trip.afternoon.bus}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Incidents */}
                    {trip.incidents.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Sự cố</h4>
                        {trip.incidents.map((incident, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground">{incident.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Gộp ParentNav từ Layout.tsx */}
      <ParentNav />
    </div>
  )
}
