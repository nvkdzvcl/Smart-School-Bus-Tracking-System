// apps/driver-app/src/routes/IncidentsPage.tsx (Tên file của bạn)

import { useEffect, useState, useCallback } from "react" // <-- Thêm useCallback
import { useNavigate } from "react-router-dom"
import axios from "axios" // <-- THÊM axios

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Textarea } from "../../components/ui/Textarea"
import { Label } from "../../components/ui/Label"

// --- THÊM 2 DÒNG NÀY ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
// Enum này phải khớp với 'report.enums.ts' của BE
enum ReportTypeBE {
  STUDENT_ABSENT = 'student_absent',
  INCIDENT = 'incident',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

// --- SỬA LẠI INTERFACE NÀY ---
// Để khớp với 'report.entity.ts' (BE trả về)
interface Incident {
  id: string // BE trả về uuid
  type: ReportTypeBE | string // Kiểu BE
  title: string // BE có 'title'
  content: string // FE gọi là 'description', BE gọi là 'content'
  createdAt: string // BE trả về 'createdAt'
  status: "pending" | "resolved"
}

// --- SỬA LẠI ID CỦA FE ---
// Để chúng ta có thể "dịch" sang enum của BE
const incidentTypes = [
  { id: "incident_traffic", label: "Kẹt xe", icon: "🚦" },
  { id: "student_absent", label: "Học sinh vắng", icon: "👤" },
  { id: "incident_vehicle", label: "Xe hỏng", icon: "🔧" },
  { id: "incident_accident", label: "Tai nạn nhẹ", icon: "⚠️" },
  { id: "other", label: "Khác", icon: "📝" },
]

// --- HÀM HỖ TRỢ: Dịch 'type' từ FE sang BE ---
const translateFeTypeToBeType = (feType: string): ReportTypeBE => {
  if (feType === "student_absent") return ReportTypeBE.STUDENT_ABSENT
  if (feType === "other") return ReportTypeBE.OTHER
  // Tất cả các loại 'incident_' khác đều là 'incident'
  if (feType.startsWith("incident_")) return ReportTypeBE.INCIDENT
  return ReportTypeBE.OTHER // Mặc định
}

export default function IncidentsPage() {
  const navigate = useNavigate()
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedType, setSelectedType] = useState("") // (Giữ nguyên)
  const [description, setDescription] = useState("") // (Giữ nguyên)
  const [isSubmitting, setIsSubmitting] = useState(false) // (Giữ nguyên)

  // --- SỬA LẠI STATE NÀY ---
  const [incidents, setIncidents] = useState<Incident[]>([]) // Bắt đầu rỗng
  const [isLoading, setIsLoading] = useState(true) // Thêm state loading
  const [error, setError] = useState<string | null>(null)

  // --- HÀM MỚI: Tải lịch sử báo cáo từ BE ---
  const fetchIncidents = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return navigate("/")

    setIsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Map lại dữ liệu (vì BE trả về 'content' và 'createdAt')
      const mappedIncidents = response.data.map((report: any) => ({
        ...report,
        description: report.content, // Đổi tên 'content' -> 'description'
        timestamp: new Date(report.createdAt).toLocaleString("vi-VN"), // Format lại
      }))
      setIncidents(mappedIncidents)
      setError(null)
    } catch (err) {
      console.error("Lỗi khi tải lịch sử báo cáo:", err)
      setError("Không thể tải lịch sử báo cáo.")
    } finally {
      setIsLoading(false)
    }
  }, [navigate])


  // --- SỬA LẠI useEffect ---
  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      navigate("/")
    } else {
      fetchIncidents() // Gọi hàm tải dữ liệu khi load trang
    }
  }, [navigate, fetchIncidents]) // Thêm fetchIncidents

  
  // --- SỬA LẠI HOÀN TOÀN HÀM NÀY ---
  const handleSubmitIncident = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return navigate("/")
    
    if (!selectedType || !description.trim()) {
      alert("Vui lòng chọn loại sự cố và nhập mô tả")
      return
    }

    // 1. Lấy thông tin từ FE
    const feTypeInfo = incidentTypes.find((t) => t.id === selectedType)
    if (!feTypeInfo) {
      alert("Loại sự cố không hợp lệ")
      return
    }

    // 2. Dịch sang DTO của BE
    const reportDto = {
      title: feTypeInfo.label, // Tự động lấy "Kẹt xe", "Xe hỏng"...
      content: description.trim(),
      type: translateFeTypeToBeType(feTypeInfo.id), // Dịch sang enum BE
      // studentId: (nếu cần, bạn có thể thêm logic chọn học sinh)
    }

    setIsSubmitting(true)

    // 3. Gọi API thật
    try {
      await axios.post(`${API_URL}/reports`, reportDto, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // 4. Thành công
      alert("Báo cáo sự cố đã được gửi thành công!")
      
      // Reset form
      setSelectedType("")
      setDescription("")
      setShowReportForm(false)
      
      // Tải lại danh sách (để thấy báo cáo mới)
      await fetchIncidents() 
      
    } catch (err: any) {
      console.error("Lỗi khi gửi báo cáo:", err)
      if (axios.isAxiosError(err) && err.response) {
        alert(err.response.data.message || "Không thể gửi báo cáo.")
      } else {
        alert("Không thể gửi báo cáo. Vui lòng thử lại.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // --- HÀM MỚI: Hiển thị danh sách sự cố ---
  const renderIncidentList = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đang tải lịch sử sự cố...</p>
        </div>
      )
    }
    
    if (error) {
       return (
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
        </div>
      )
    }

    if (incidents.length === 0) {
      return (
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
              d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-muted-foreground">Chưa có sự cố nào được báo cáo</p>
        </div>
      )
    }

    return incidents.map((incident) => (
      <div
        key={incident.id}
        className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-card to-muted/20"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{incident.title}</h3>
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
            {/* SỬA: Dùng 'content' thay vì 'description' (vì 'description' không có trong object BE) */}
            <p className="text-sm text-muted-foreground">{incident.content}</p>
          </div>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground mt-3">
          {/* (Phần location có thể bỏ nếu BE không trả về) */}
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {/* SỬA: Dùng 'createdAt' (từ BE) thay vì 'timestamp' (từ FE) */}
            <span>{new Date(incident.createdAt).toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>
    ))
  }


  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header (Giữ nguyên) */}
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
        {/* Report Form (Giữ nguyên) */}
        {showReportForm && (
          <Card className="border-destructive/30 bg-gradient-to-br from-card to-destructive/5 rounded-lg">
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
                      className={`h-auto py-3 flex flex-col items-center gap-2 ${selectedType === type.id
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border text-foreground hover:bg-muted bg-transparent"
                        } rounded-lg`}
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
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
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
                  className="flex-1 border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitIncident}
                  disabled={isSubmitting}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Report Buttons (Giữ nguyên) */}
        {!showReportForm && (
          <Card className="border-border/50 rounded-lg">
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
                    className="h-auto py-3 flex flex-col items-center gap-2 border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incidents List (Sửa lại) */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Lịch sử sự cố</CardTitle>
          </CardHeader>
          {/* --- SỬA LỖI Ở ĐÂY --- */}
          <CardContent className="space-y-3">
            {renderIncidentList()}
          </CardContent> 
          {/* --- SỬA </Same> THÀNH </CardContent> --- */}
        </Card>

        {/* Safety Tips (Giữ nguyên) */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-accent/5 rounded-lg">
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