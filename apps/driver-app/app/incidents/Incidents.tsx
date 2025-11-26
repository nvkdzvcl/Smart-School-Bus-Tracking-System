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

// 1. ĐỊNH NGHĨA TỪ ĐIỂN NGÔN NGỮ (STATIC TEXT)
const TRANSLATIONS = {
  vi: {
    pageTitle: "Báo cáo sự cố",
    subTitle: "Quản lý sự cố",
    btnReport: "Báo cáo",
    newReportTitle: "Báo cáo sự cố mới",
    labelType: "Loại sự cố",
    
    // --- [MOD] Thêm từ điển cho phần chọn học sinh ---
    labelStudent: "Chọn học sinh vắng mặt",
    selectStudentPlaceholder: "-- Chọn học sinh --",
    loadingStudents: "Đang tải danh sách học sinh...",
    
    labelDesc: "Mô tả chi tiết",
    placeholderDesc: "Nhập mô tả chi tiết về sự cố...",
    labelImage: "Đính kèm ảnh (tối đa 1 ảnh)",
    btnSelectImage: "Chọn/Chụp ảnh",
    btnDelete: "Xóa",
    btnCancel: "Hủy",
    btnSubmit: "Gửi báo cáo",
    submitting: "Đang gửi...",
    quickReport: "Báo cáo nhanh",
    historyTitle: "Lịch sử sự cố",
    
    // Status
    statusResolved: "Đã xử lý",
    statusPending: "Đang xử lý",
    
    // Messages
    loading: "Đang tải lịch sử sự cố...",
    errorLoad: "Không thể tải lịch sử báo cáo.",
    emptyList: "Chưa có sự cố nào được báo cáo",
    alertSize: "Kích thước ảnh không được vượt quá 5MB.",
    alertMissing: "Vui lòng chọn loại sự cố và nhập mô tả",
    alertMissingStudent: "Vui lòng chọn học sinh vắng mặt", // --- [MOD]
    alertSuccess: "Báo cáo sự cố đã được gửi thành công!",
    
    // Safety Tips
    tip1: "Dừng xe an toàn trước khi báo cáo sự cố",
    tip2: "Liên hệ quản lý ngay khi có sự cố nghiêm trọng",
    tip3: "Chụp ảnh hiện trường nếu cần thiết",
    safetyTitle: "Lưu ý an toàn"
  },
  en: {
    pageTitle: "Incident Report",
    subTitle: "Manage incidents",
    btnReport: "Report",
    newReportTitle: "New Incident Report",
    labelType: "Incident Type",

    // --- [MOD] English keys ---
    labelStudent: "Select Absent Student",
    selectStudentPlaceholder: "-- Select Student --",
    loadingStudents: "Loading student list...",

    labelDesc: "Description",
    placeholderDesc: "Enter detailed description...",
    labelImage: "Attach Image (max 1)",
    btnSelectImage: "Select/Take Photo",
    btnDelete: "Delete",
    btnCancel: "Cancel",
    btnSubmit: "Submit Report",
    submitting: "Sending...",
    quickReport: "Quick Report",
    historyTitle: "Incident History",
    
    // Status
    statusResolved: "Resolved",
    statusPending: "Pending",
    
    // Messages
    loading: "Loading incident history...",
    errorLoad: "Unable to load history.",
    emptyList: "No incidents reported yet",
    alertSize: "Image size must not exceed 5MB.",
    alertMissing: "Please select incident type and enter description",
    alertMissingStudent: "Please select the absent student", // --- [MOD]
    alertSuccess: "Incident report sent successfully!",
    
    // Safety Tips
    tip1: "Stop safely before reporting",
    tip2: "Contact manager immediately for serious incidents",
    tip3: "Take photos of the scene if necessary",
    safetyTitle: "Safety Tips"
  }
}

// 2. ĐỊNH NGHĨA LABEL CHO TỪNG LOẠI SỰ CỐ (DYNAMIC DATA)
const INCIDENT_TYPE_LABELS = {
  vi: {
    incident_traffic: "Kẹt xe",
    student_absent: "Học sinh vắng",
    incident_vehicle: "Xe hỏng",
    incident_accident: "Tai nạn nhẹ",
    other: "Khác",
  },
  en: {
    incident_traffic: "Traffic Jam",
    student_absent: "Student Absent",
    incident_vehicle: "Vehicle Breakdown",
    incident_accident: "Minor Accident",
    other: "Other",
  }
}

const INCIDENT_ICONS: Record<string, string> = {
  incident_traffic: "🚦",
  student_absent: "👤",
  incident_vehicle: "🔧",
  incident_accident: "⚠️",
  other: "📝",
}

enum ReportTypeBE {
  STUDENT_ABSENT = 'student_absent',
  INCIDENT_TRAFFIC = 'incident_traffic',
  INCIDENT_VEHICLE = 'incident_vehicle',
  INCIDENT_ACCIDENT = 'incident_accident',
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
  studentId?: string // --- [MOD] Thêm field studentId nếu cần hiển thị lại
}

// --- [MOD] Interface cho Student ---
interface StudentSimple {
  id: string;
  full_name: string;
}

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

export default function IncidentsPage() {
  const navigate = useNavigate()
  
  const [language] = useState<'vi' | 'en'>(() => {
    const saved = localStorage.getItem("language")
    return saved === 'en' ? 'en' : 'vi'
  })
  const t = TRANSLATIONS[language]
  const typeLabels = INCIDENT_TYPE_LABELS[language]

  const imageInputRef = useRef<HTMLInputElement>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  
  const [selectedType, setSelectedType] = useState("") 
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  // --- [MOD] State cho danh sách học sinh ---
  const [students, setStudents] = useState<StudentSimple[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  const incidentOptions = Object.entries(INCIDENT_ICONS).map(([id, icon]) => ({
    id,
    icon,
    label: typeLabels[id as keyof typeof typeLabels] || typeLabels.other
  }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewSrc(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!previewSrc) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [previewSrc])

  // --- [MOD] Hàm load học sinh khi chọn type = student_absent ---
const fetchTripStudents = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    setLoadingStudents(true)
    console.log("🚀 Bắt đầu gọi API lấy danh sách học sinh..."); // Log 1

    try {
      const response = await axios.get(`${API_URL}/trips/current/students`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      console.log("✅ API trả về:", response.data); // Log 2: Xem kết quả API
      setStudents(response.data)

      if (response.data.length === 0) {
        console.warn("⚠️ Danh sách rỗng! Có thể do chưa có chuyến đi nào đang IN_PROGRESS.");
      }

    } catch (err) {
      console.error("❌ Lỗi tải danh sách học sinh:", err)
      alert("Lỗi kết nối server khi tải danh sách học sinh.")
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  // --- [MOD] Trigger load học sinh khi đổi type ---
  useEffect(() => {
    if (selectedType === 'student_absent') {
      fetchTripStudents()
    } else {
        // Reset nếu chọn loại khác
        setSelectedStudentId("")
    }
  }, [selectedType, fetchTripStudents])


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size > 5 * 1024 * 1024) {
      alert(t.alertSize)
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
    setSelectedStudentId("") // --- [MOD] Reset student
    setShowReportForm(false)
  }

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
      setError(t.errorLoad)
    } finally {
      setIsLoading(false)
    }
  }, [navigate, t.errorLoad])

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      navigate("/")
    } else {
      fetchIncidents()
    }
  }, [navigate, fetchIncidents])

  const handleSubmitIncident = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return navigate("/")

    if (!selectedType || !description.trim()) {
      alert(t.alertMissing)
      return
    }

    // --- [MOD] Validation cho trường hợp học sinh vắng ---
    if (selectedType === 'student_absent' && !selectedStudentId) {
        alert(t.alertMissingStudent)
        return
    }

    const label = typeLabels[selectedType as keyof typeof typeLabels] || "Other"

    const formData = new FormData()
    formData.append("title", label)
    formData.append("content", description.trim())
    formData.append("type", selectedType)
    
    // --- [MOD] Gửi kèm student_id lên BE ---
    if (selectedType === 'student_absent' && selectedStudentId) {
        formData.append("studentId", selectedStudentId)
        // Lưu ý: Key "studentId" này phải khớp với DTO trong NestJS (File ReportController)
    }

    if (selectedImage) {
      formData.append("image", selectedImage, selectedImage.name)
    }

    setIsSubmitting(true)
    try {
      await axios.post(`${API_URL}/reports`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      alert(t.alertSuccess)
      resetForm()
      await fetchIncidents()
    } catch (err: any) {
      console.error("Lỗi khi gửi báo cáo:", err)
      if (axios.isAxiosError(err) && err.response) {
        alert((err.response.data as any)?.message || "Error.")
      } else {
        alert("Error.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderIncidentList = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-destructive">{error || t.errorLoad}</p>
        </div>
      )
    }

    if (incidents.length === 0) {
      return (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-muted-foreground">{t.emptyList}</p>
        </div>
      )
    }

    return incidents.map((incident) => {
      const displayTitle = typeLabels[incident.type as keyof typeof typeLabels] || incident.title
      const icon = INCIDENT_ICONS[incident.type as string] || INCIDENT_ICONS['other']
      const imgSrc = toImgSrc(incident.imageUrl)

      return (
        <div key={incident.id} className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-card to-muted/20">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl mr-1">{icon}</span>
                <h3 className="font-semibold text-foreground">{displayTitle}</h3>
                <Badge className={incident.status === "resolved" ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"}>
                  {incident.status === "resolved" ? t.statusResolved : t.statusPending}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{incident.content}</p>
            </div>
          </div>
          {imgSrc && (
            <div className="mt-3 group relative overflow-hidden rounded-md border border-border/70">
              <img
                src={imgSrc}
                loading="lazy"
                alt={`Incident: ${displayTitle}`}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{new Date(incident.createdAt).toLocaleString(language === 'vi' ? "vi-VN" : "en-US")}</span>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-foreground hover:bg-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{t.pageTitle}</h1>
                <p className="text-xs text-muted-foreground">{t.subTitle}</p>
              </div>
            </div>
            {!showReportForm && (
              <Button onClick={() => setShowReportForm(true)} size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.btnReport}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {showReportForm && (
          <Card className="border-destructive/30 bg-gradient-to-br from-card to-destructive/5 rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground">{t.newReportTitle}</CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">{t.labelType}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {incidentOptions.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      onClick={() => setSelectedType(type.id)}
                      className={`h-auto py-3 flex flex-col items-center gap-2 ${selectedType === type.id ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-foreground hover:bg-muted bg-transparent"} rounded-lg`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* --- [MOD] START: UI CHỌN HỌC SINH (Chỉ hiện khi type là student_absent) --- */}
              {selectedType === 'student_absent' && (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <Label className="text-destructive font-semibold flex items-center gap-2">
                    {t.labelStudent} <span className="text-xs font-normal text-muted-foreground">({students.length})</span>
                  </Label>
                  {loadingStudents ? (
                    <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.loadingStudents}
                    </div>
                  ) : (
                    <select 
                      className="w-full p-2 rounded-md border border-border bg-background text-foreground focus:ring-2 focus:ring-destructive focus:outline-none"
                      value={selectedStudentId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedStudentId(val);
                        // Tự động điền mô tả nếu chưa có
                        if (!description && val) {
                            const st = students.find(s => s.id === val);
                            if (st) setDescription(`Học sinh ${st.full_name} vắng mặt tại điểm đón.`);
                        }
                      }}
                    >
                      <option value="">{t.selectStudentPlaceholder}</option>
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.full_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {/* --- [MOD] END --- */}

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">{t.labelDesc}</Label>
                <Textarea id="description" placeholder={t.placeholderDesc} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="bg-background border-border text-foreground resize-none" />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">{t.labelImage}</Label>
                {selectedImage ? (
                  <div className="flex items-center justify-between p-3 border border-border/70 rounded-lg bg-muted/50">
                    <span className="text-sm truncate mr-3">{selectedImage.name}</span>
                    <Button variant="destructive" size="sm" onClick={() => setSelectedImage(null)} className="flex-shrink-0">{t.btnDelete}</Button>
                  </div>
                ) : (
                  <>
                    <Input type="file" id="image-upload" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                    <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted bg-transparent rounded-lg" onClick={() => imageInputRef.current?.click()}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t.btnSelectImage}
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={resetForm} className="flex-1 border-border text-foreground hover:bg-muted bg-transparent rounded-lg">{t.btnCancel}</Button>
                <Button onClick={handleSubmitIncident} disabled={isSubmitting} className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg">
                  {isSubmitting ? t.submitting : t.btnSubmit}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showReportForm && (
          <Card className="border-border/50 rounded-lg">
            <CardHeader><CardTitle className="text-base text-foreground">{t.quickReport}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {incidentOptions.slice(0, 4).map((type) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    onClick={() => { setSelectedType(type.id); setShowReportForm(true); }}
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

        <Card className="border-border/50 rounded-lg">
          <CardHeader><CardTitle className="text-base text-foreground">{t.historyTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-3">{renderIncidentList()}</CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-card to-accent/5 rounded-lg">
          <CardHeader><CardTitle className="text-base text-foreground">{t.safetyTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2"><svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p>{t.tip1}</p></div>
            <div className="flex items-start gap-2"><svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p>{t.tip2}</p></div>
            <div className="flex items-start gap-2"><svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p>{t.tip3}</p></div>
          </CardContent>
        </Card>
      </main>
      {previewSrc && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewSrc(null)} role="dialog" aria-modal="true">
          <div className="relative max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewSrc(null)} className="absolute -top-3 -right-3 rounded-full bg-white/90 text-black hover:bg-white p-2 shadow-lg" aria-label="Đóng" title="Đóng (Esc)">✕</button>
            <img src={previewSrc} alt="Xem ảnh" className="max-w-[95vw] max-h-[90vh] object-contain rounded-md shadow-2xl select-none" draggable={false} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/80">Nhấn nền hoặc Esc để đóng</div>
          </div>
        </div>
      )}
      <MobileNav />
    </div>
  )
}