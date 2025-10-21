import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Textarea } from "../../components/ui/Textarea"
import { Label } from "../../components/ui/Label"

interface Incident {
  id: number
  type: string
  description: string
  timestamp: string
  status: "pending" | "resolved"
  location?: string
  photos?: string[]
}

const incidentTypes = [
  { id: "traffic", label: "Kẹt xe", icon: "🚦" },
  { id: "absent", label: "Học sinh vắng", icon: "👤" },
  { id: "vehicle", label: "Xe hỏng", icon: "🔧" },
  { id: "accident", label: "Tai nạn nhẹ", icon: "⚠️" },
  { id: "other", label: "Khác", icon: "📝" },
]

export default function IncidentsPage() {
  const navigate = useNavigate()
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 1,
      type: "Kẹt xe",
      description: "Kẹt xe nghiêm trọng trên đường Lê Lợi, dự kiến trễ 10 phút",
      timestamp: "2025-01-12 15:45",
      status: "resolved",
      location: "Đường Lê Lợi, Quận 1",
    },
    {
      id: 2,
      type: "Học sinh vắng",
      description: "Học sinh Nguyễn Văn A không có mặt tại điểm đón",
      timestamp: "2025-01-11 06:35",
      status: "resolved",
      location: "123 Đường Lê Lợi, Quận 1",
    },
  ])

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      navigate("/")
    }
  }, [navigate])

  const handleSubmitIncident = async () => {
    if (!selectedType || !description.trim()) {
      alert("Vui lòng chọn loại sự cố và nhập mô tả")
      return
    }

    setIsSubmitting(true)

    // Giả lập API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newIncident: Incident = {
      id: incidents.length + 1,
      type: incidentTypes.find((t) => t.id === selectedType)?.label || selectedType,
      description: description.trim(),
      timestamp: new Date().toLocaleString("vi-VN"),
      status: "pending",
      location: "Vị trí hiện tại",
    }

    setIncidents([newIncident, ...incidents])
    setSelectedType("")
    setDescription("")
    setShowReportForm(false)
    setIsSubmitting(false)

    alert("Báo cáo sự cố đã được gửi thành công!")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-foreground hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Báo cáo sự cố</h1>
                <p className="text-xs text-muted-foreground">Quản lý sự cố</p>
              </div>
            </div>
            {!showReportForm && (
              <Button
                onClick={() => setShowReportForm(true)}
                size="sm"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Báo cáo
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Report Form */}
        {showReportForm && (
          <Card className="border-destructive/30 bg-gradient-to-br from-card to-destructive/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground">Báo cáo sự cố mới</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReportForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Loại sự cố</Label>
                <div className="grid grid-cols-2 gap-2">
                  {incidentTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      onClick={() => setSelectedType(type.id)}
                      className={`h-auto py-3 flex flex-col items-center gap-2 ${
                        selectedType === type.id
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border text-foreground hover:bg-muted bg-transparent"
                      }`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Mô tả chi tiết
                </Label>
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả chi tiết về sự cố..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-background border-border text-foreground resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Đính kèm ảnh (tùy chọn)</Label>
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                  onClick={() => alert("Chức năng chụp ảnh")}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Chụp ảnh
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitIncident}
                  disabled={isSubmitting}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Report Buttons */}
        {!showReportForm && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Báo cáo nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {incidentTypes.slice(0, 4).map((type) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    onClick={() => {
                      setSelectedType(type.id)
                      setShowReportForm(true)
                    }}
                    className="h-auto py-3 flex flex-col items-center gap-2 border-border text-foreground hover:bg-muted bg-transparent"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incidents List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Lịch sử sự cố</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 mx-auto text-muted-foreground mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-muted-foreground">Chưa có sự cố nào được báo cáo</p>
              </div>
            ) : (
              incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-card to-muted/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{incident.type}</h3>
                        <Badge
                          className={
                            incident.status === "resolved"
                              ? "bg-accent text-accent-foreground"
                              : "bg-destructive text-destructive-foreground"
                          }
                        >
                          {incident.status === "resolved" ? "Đã xử lý" : "Đang xử lý"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{incident.description}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground mt-3">
                    {incident.location && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{incident.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{incident.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-accent/5">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Lưu ý an toàn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Dừng xe an toàn trước khi báo cáo sự cố</p>
            </div>
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Liên hệ quản lý ngay khi có sự cố nghiêm trọng</p>
            </div>
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Chụp ảnh hiện trường nếu cần thiết</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}
