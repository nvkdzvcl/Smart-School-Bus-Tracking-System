"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Phone, AlertCircle, Clock, CheckCircle2, XCircle, Edit, UserPlus } from "lucide-react"

export default function ParentProfilePage() {
  const [selectedTab, setSelectedTab] = useState("info")

  // Mock data
  const student = {
    name: "Nguyễn Minh An",
    class: "Lớp 3A",
    photo: "/diverse-students-studying.png",
    pickupPoint: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
    dropoffPoint: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
    emergencyContact: "0912-345-678 (Mẹ)",
    notes: "Con bị say xe, cần ngồi gần cửa sổ",
  }

  const currentBus = {
    licensePlate: "51B-12345",
    driver: "Trần Văn Bình",
    route: "Tuyến A - Quận 7",
  }

  const authorizedPickup = [
    { id: 1, name: "Nguyễn Thị B (Mẹ)", phone: "0912-345-678", relation: "Mẹ", verified: true },
    { id: 2, name: "Nguyễn Văn C (Bố)", phone: "0913-456-789", relation: "Bố", verified: true },
    { id: 3, name: "Trần Thị D (Bà ngoại)", phone: "0914-567-890", relation: "Bà ngoại", verified: false },
  ]

  const attendanceHistory = [
    { date: "2025-01-13", morning: "07:15", afternoon: "16:30", status: "present" },
    { date: "2025-01-12", morning: "07:20", afternoon: "16:35", status: "present" },
    { date: "2025-01-11", morning: "-", afternoon: "-", status: "absent" },
    { date: "2025-01-10", morning: "07:18", afternoon: "16:32", status: "present" },
    { date: "2025-01-09", morning: "07:22", afternoon: "16:40", status: "late" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Hồ sơ học sinh</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Student Header */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={student.photo || "/placeholder.svg"}
                alt={student.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/20"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                <p className="text-muted-foreground mb-3">{student.class}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    Quận 7
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    {currentBus.route}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="pickup">Người đón</TabsTrigger>
            <TabsTrigger value="attendance">Điểm danh</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">Thông tin cơ bản</h3>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Sửa
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Điểm đón</p>
                      <p className="text-sm font-medium text-foreground">{student.pickupPoint}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Điểm trả</p>
                      <p className="text-sm font-medium text-foreground">{student.dropoffPoint}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Liên hệ khẩn cấp</p>
                      <p className="text-sm font-medium text-foreground">{student.emergencyContact}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Ghi chú đặc biệt</p>
                      <p className="text-sm font-medium text-foreground">{student.notes}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Xe & Tài xế hiện tại</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Biển số xe</span>
                    <Badge variant="outline" className="font-mono">
                      {currentBus.licensePlate}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tài xế</span>
                    <span className="text-sm font-medium text-foreground">{currentBus.driver}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tuyến</span>
                    <span className="text-sm font-medium text-foreground">{currentBus.route}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authorized Pickup Tab */}
          <TabsContent value="pickup" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Người được phép đón</h3>
                  <Button size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Thêm
                  </Button>
                </div>

                <div className="space-y-3">
                  {authorizedPickup.map((person) => (
                    <div key={person.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{person.name}</p>
                          {person.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Chờ xác nhận
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{person.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1">{person.relation}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Người đón mới cần được quản lý xác nhận trước khi có thể đón học sinh.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Lịch sử điểm danh</h3>

                <div className="space-y-2">
                  {attendanceHistory.map((record) => (
                    <div key={record.date} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-shrink-0">
                        {record.status === "present" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : record.status === "absent" ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">
                            {new Date(record.date).toLocaleDateString("vi-VN", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </p>
                          <Badge
                            variant={
                              record.status === "present"
                                ? "default"
                                : record.status === "absent"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {record.status === "present" ? "Có mặt" : record.status === "absent" ? "Vắng" : "Trễ"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Sáng: {record.morning}</span>
                          <span>Chiều: {record.afternoon}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
