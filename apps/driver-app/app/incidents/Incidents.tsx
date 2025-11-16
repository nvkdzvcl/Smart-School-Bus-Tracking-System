// apps/driver-app/src/routes/IncidentsPage.tsx

import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Textarea } from "../../components/ui/Textarea"
import { Label } from "../../components/ui/Label"
import { Input } from "../../components/ui/Input"

// --- CẤU HÌNH API ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

// Enum này phải khớp với 'report.enums.ts' của BE
enum ReportTypeBE {
  STUDENT_ABSENT = 'student_absent',
  INCIDENT = 'incident',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

// --- INTERFACE KHỚP VỚI BE ---
interface Incident {
  id: string
  type: ReportTypeBE | string
  title: string
  content: string
  createdAt: string
  status: "pending" | "resolved"
  imageUrl?: string
}

// --- ID LOẠI SỰ CỐ CỦA FE ---
const incidentTypes = [
  { id: "incident_traffic", label: "Kẹt xe", icon: "🚦" },
  { id: "student_absent", label: "Học sinh vắng", icon: "👤" },
  { id: "incident_vehicle", label: "Xe hỏng", icon: "🔧" },
  { id: "incident_accident", label: "Tai nạn nhẹ", icon: "⚠️" },
  { id: "other", label: "Khác", icon: "📝" },
]

// Chuẩn hoá URL ảnh từ BE để luôn render được
const toImgSrc = (u?: string) => {
  if (!u) return undefined
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  if (u.startsWith('//')) return `https:${u}`
  if (u.startsWith('/')) return `${API_URL}${u}`
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return `https://${u}`
  return `${API_URL}/static/uploads/incidents/${u}`
}

const basenameFromUrl = (u?: string) => {
  if (!u) return undefined
  try {
    const full = u.startsWith('http') ? u : (u.startsWith('//') ? `https:${u}` : u)
    const last = full.split('?')[0].split('#')[0].split('/').pop()
    return last || undefined
  } catch {
    return undefined
  }
}

// --- Dịch 'type' từ FE sang BE ---
const translateFeTypeToBeType = (feType: string): ReportTypeBE => {
  if (feType === "student_absent") return ReportTypeBE.STUDENT_ABSENT
  if (feType === "other") return ReportTypeBE.OTHER
  if (feType.startsWith("incident_")) return ReportTypeBE.INCIDENT
  return ReportTypeBE.OTHER
}

export default function IncidentsPage() {
  const navigate = useNavigate()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lightbox preview
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  // ESC để đóng lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewSrc(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Chặn cuộn body khi mở lightbox
  useEffect(() => {
    if (!previewSrc) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [previewSrc])

  // Xử lý chọn file ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 5MB.")
      setSelectedImage(null)
      e.target.value = ''
      return
    }
    setSelectedImage(file || null)
  }

  const resetForm = () => {
    setSelectedType("")
    setDescription("")
    setSelectedImage(null)
    setShowReportForm(false)
  }

  // --- Tải lịch sử báo cáo ---
  const fetchIncidents = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return navigate("/")

    setIsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setIncidents(response.data)
      setError(null)
    } catch (err) {
      console.error("Lỗi khi tải lịch sử báo cáo:", err)
      setError("Không thể tải lịch sử báo cáo.")
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      navigate("/")
    } else {
      fetchIncidents()
    }
  }, [navigate, fetchIncidents])

  // --- Gửi báo cáo (dùng FormData) ---
  const handleSubmitIncident = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return navigate("/")

    if (!selectedType || !description.trim()) {
      alert("Vui lòng chọn loại sự cố và nhập mô tả")
      return
    }

    const feTypeInfo = incidentTypes.find((t) => t.id === selectedType)
    if (!feTypeInfo) {
      alert("Loại sự cố không hợp lệ")
      return
    }

    const formData = new FormData()
    formData.append("title", feTypeInfo.label)
    formData.append("content", description.trim())
    formData.append("type", `${translateFeTypeToBeType(feTypeInfo.id)}`)
    if (selectedImage) {
      formData.append("image", selectedImage, selectedImage.name)
    }

    setIsSubmitting(true)
    try {
      await axios.post(`${API_URL}/reports`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      alert("Báo cáo sự cố đã được gửi thành công!")
      resetForm()
      await fetchIncidents()
    } catch (err: any) {
      console.error("Lỗi khi gửi báo cáo:", err)
      if (axios.isAxiosError(err) && err.response) {
        alert((err.response.data as any)?.message || "Không thể gửi báo cáo.")
      } else {
        alert("Không thể gửi báo cáo. Vui lòng thử lại.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Render danh sách ---
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

    return incidents.map((incident) => {
      const feType = incidentTypes.find(t => translateFeTypeToBeType(t.id) === incident.type)
      const icon = feType ? feType.icon : '📝'
      const imgSrc = toImgSrc(incident.imageUrl)

      return (
        <div
          key={incident.id}
          className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-card to-muted/20"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl mr-1">{icon}</span>
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
              <p className="text-sm text-muted-foreground">{incident.content}</p>
            </div>
          </div>

          {/* HIỂN THỊ HÌNH ẢNH NẾU CÓ */}
          {imgSrc && (
            <div className="mt-3 group relative overflow-hidden rounded-md border border-border/70">
              <img
                src={imgSrc}
                loading="lazy"
                alt={`Ảnh sự cố: ${incident.title}`}
                className="w-full h-auto max-h-48 object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-105 cursor-zoom-in"
                onClick={() => setPreviewSrc(imgSrc)}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement
                  if (el.dataset.fallbackTried !== '1') {
                    el.dataset.fallbackTried = '1'
                    const name = basenameFromUrl(incident.imageUrl)
                    if (name) {
                      el.src = `${API_URL}/static/uploads/incidents/${name}`
                      return
                    }
                  }
                  el.onerror = null
                  el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                }}
              />
            </div>
          )}

          <div className="space-y-1 text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{new Date(incident.createdAt).toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </div>
      )
    })
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
          <Card className="border-destructive/30 bg-gradient-to-br from-card to-destructive/5 rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground">Báo cáo sự cố mới</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loại sự cố */}
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

              {/* Mô tả chi tiết */}
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

              {/* Đính kèm ảnh */}
              <div className="space-y-2">
                <Label className="text-foreground">Đính kèm ảnh (tối đa 1 ảnh)</Label>

                {selectedImage ? (
                  <div className="flex items-center justify-between p-3 border border-border/70 rounded-lg bg-muted/50">
                    <span className="text-sm truncate mr-3">{selectedImage.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setSelectedImage(null)}
                      className="flex-shrink-0"
                    >
                      Xóa
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      ref={imageInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                      onClick={() => imageInputRef.current?.click()}
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
                      Chọn/Chụp ảnh
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={resetForm}
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

        {/* Quick Report Buttons */}
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

        {/* Incidents List */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Lịch sử sự cố</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderIncidentList()}
          </CardContent>
        </Card>

        {/* Safety Tips */}
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

      {/* Lightbox Preview – đặt ngoài danh sách, chỉ 1 modal */}
      {previewSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewSrc(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-[95vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewSrc(null)}
              className="absolute -top-3 -right-3 rounded-full bg-white/90 text-black hover:bg-white p-2 shadow-lg"
              aria-label="Đóng"
              title="Đóng (Esc)"
            >
              ✕
            </button>

            <img
              src={previewSrc}
              alt="Xem ảnh"
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-md shadow-2xl select-none"
              draggable={false}
            />

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/80">
              Nhấn nền hoặc Esc để đóng
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
