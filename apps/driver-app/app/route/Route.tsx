// apps/driver-app/src/route/Route.tsx
import { useEffect, useState, useMemo, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

interface Stop {
  id: string
  name: string
  address: string
  students: number
  status: "pending" | "current" | "completed"
  eta: string
  lat: number
  lng: number
}

type TripStatusBE = "scheduled" | "in_progress" | "completed" | "cancelled"
type TripStatusFE = TripStatusBE | "paused"

export default function RoutePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [tripStatus, setTripStatus] = useState<TripStatusFE>("scheduled")

  const [stops, setStops] = useState<Stop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- SỬA LỖI LOGIC Ở ĐÂY ---
  const { currentStop, currentStopIndex } = useMemo(() => {
    const idx = stops.findIndex((s) => s.status === "current")

    if (idx !== -1) {
      // 1. Tìm thấy điểm "current", trả về nó
      return { currentStop: stops[idx], currentStopIndex: idx }
    }

    // 2. Không tìm thấy "current".
    // Nếu chuyến đang chạy (đã đón hết) -> hiển thị ĐIỂM CUỐI CÙNG
    if (tripStatus === "in_progress" && stops.length > 0) {
      const lastIndex = stops.length - 1
      return { currentStop: stops[lastIndex], currentStopIndex: lastIndex }
    }

    // 3. Mặc định (chuyến scheduled) -> hiển thị ĐIỂM ĐẦU TIÊN
    return { currentStop: stops[0], currentStopIndex: 0 }
  }, [stops, tripStatus]) // <-- THÊM tripStatus VÀO ĐÂY
  // --- HẾT SỬA ---

  // --- Tách hàm fetchRouteDetails ra ngoài, dùng useCallback ---
  const fetchRouteDetails = useCallback(async (token: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/schedule/active-trip-details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setStops(response.data.stops || [])
      setTripStatus(response.data.tripStatus)
      setError(null)
    } catch (err) {
      console.error("Lỗi khi tải chi tiết lộ trình:", err)
      setError("Không thể tải chi tiết lộ trình. Vui lòng thử lại.")
      setStops([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // useEffect 1: Chạy LẠI mỗi khi vào trang
  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    const token = localStorage.getItem("access_token")
    if (!authenticated || !token) {
      navigate("/")
      return
    }
    setIsLoading(true)
    fetchRouteDetails(token)
  }, [navigate, fetchRouteDetails, location.key]) // Dependency chuẩn

  // useEffect 2: Chỉ chạy mô phỏng tốc độ
  useEffect(() => {
    const speedInterval = setInterval(() => {
      if (tripStatus === "in_progress") {
        setCurrentSpeed(Math.floor(Math.random() * 40) + 20)
      } else {
        setCurrentSpeed(0)
      }
    }, 2000)
    return () => clearInterval(speedInterval)
  }, [tripStatus])

  // --- NÂNG CẤP handleStartTrip ---
  const handleStartTrip = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return navigate("/")

    try {
      const response = await axios.patch(
        `${API_URL}/schedule/start-trip`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setTripStatus(response.data.newStatus)
      await fetchRouteDetails(token) // Gọi lại để lấy stops 'current'
    } catch (err: any) {
      console.error("Lỗi khi bắt đầu chuyến:", err)
      if (axios.isAxiosError(err) && err.response) {
        alert(err.response.data.message || "Không thể bắt đầu chuyến.")
      } else {
        alert("Không thể bắt đầu chuyến đi. Vui lòng thử lại.")
      }
    }
  }

  // (Các hàm Tạm dừng / Tiếp tục giữ nguyên)
  const handlePauseTrip = () => setTripStatus("paused")
  const handleResumeTrip = () => setTripStatus("in_progress")

const handleNavigate = () => {
    if (!currentStop) return // An toàn

    // --- SỬA LẠI TOÀN BỘ HÀM NÀY ---
    // 1. Dùng link "https://maps.google.com/?q="
    // 2. Sửa cú pháp thành ${currentStop.lat} và ${currentStop.lng}
    window.open(
      `https://maps.google.com/?q=${currentStop.lat},${currentStop.lng}`,
      "_blank",
    )
  }

  // (Code xử lý "Đang tải" giữ nguyên)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Đang tải chi tiết lộ trình...</p>
      </div>
    )
  }

  // (Code xử lý "Lỗi" giữ nguyên)
  if (error || !currentStop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <p className="text-destructive mb-4">
          {error || "Không tìm thấy dữ liệu chuyến đi."}
        </p>
        <Button onClick={() => navigate("/dashboard")}>Quay về Bảng tin</Button>
      </div>
    )
  }

  // (Code getBadgeText, getBadgeClass giữ nguyên)
  const getBadgeText = () => {
    if (tripStatus === "in_progress") return "Đang chạy"
    if (tripStatus === "paused") return "Tạm dừng"
    return "Chưa bắt đầu"
  }
  const getBadgeClass = () => {
    if (tripStatus === "in_progress")
      return "bg-primary text-primary-foreground"
    if (tripStatus === "paused")
      return "bg-destructive text-destructive-foreground"
    return "bg-secondary text-secondary-foreground border border-border/50"
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
                className="text-foreground hover:bg-muted/70"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Lộ trình
                </h1>
                    <p className="text-xs text-muted-foreground">{currentStop?.name || 'Tuyến A - Quận 1'}</p>
              </div>
            </div>
            <Badge className={getBadgeClass() + " rounded-full px-3 py-0.5"}>
              {getBadgeText()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Map Placeholder & Nút Bấm (Giữ nguyên) */}
        <Card className="border-border/50 overflow-hidden rounded-lg">
          <div className="relative h-64 bg-gradient-to-br from-secondary to-accent/20">
            {/* ... (Code SVG bản đồ) ... */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <svg className="w-16 h-16 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Bản đồ GPS</p>
              </div>
            </div>
            {/* ... (Code Tốc độ và Vị trí) ... */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary tabular-nums">{currentSpeed}</div>
                <div className="text-xs text-muted-foreground">km/h</div>
              </div>
            </div>
            {tripStatus === "in_progress" && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                  <div className="relative w-4 h-4 bg-primary rounded-full border-2 border-background" />
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-4 bg-card">
            <div className="flex gap-2">
              {/* (Nút Bắt đầu, Tạm dừng, Chỉ đường, Tiếp tục... giữ nguyên) */}
              {tripStatus === "scheduled" && (
                <Button
                  onClick={handleStartTrip}
                  className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bắt đầu chuyến
                </Button>
              )}
              {tripStatus === "in_progress" && (
                <>
                  <Button
                    onClick={handlePauseTrip}
                    variant="outline"
                    className="flex-1 border-border text-foreground hover:bg-muted/70 bg-transparent rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Tạm dừng
                  </Button>
                  <Button
                    onClick={handleNavigate}
                    className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    Chỉ đường
                  </Button>
                </>
              )}
              {tripStatus === "paused" && (
                <Button
                  onClick={handleResumeTrip}
                  className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tiếp tục
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Stop Info (Dùng currentStop "thật") */}
        <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 rounded-lg">
          <CardContent className="px-4 pt-6 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary text-primary-foreground rounded-lg">
                    {/* Thêm logic nhỏ này cho đẹp */}
                    {currentStop.status === "current"
                      ? "Điểm hiện tại"
                      : "Điểm tiếp theo"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {currentStop.eta}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">
                  {currentStop.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentStop.address}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {/* Dùng currentStop "thật" */}
                <span>{currentStop.students} học sinh</span>
              </div>

              {/* Nút "Điểm danh" (Giữ nguyên) */}
              <Button
                onClick={() => navigate("/students")}
                size="sm"
                disabled={tripStatus !== "in_progress"}
                className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
              >
                Điểm danh / DS Học sinh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Route Progress (Giữ nguyên, tự động đúng) */}
        <Card className="border-border/50 rounded-lg">
          <CardContent className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Tiến độ tuyến</h3>
              <span className="text-sm text-muted-foreground">
                {/* 'currentStopIndex' bây giờ là "thật" */}
                {currentStopIndex + 1}/{stops.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        index < currentStopIndex
                          ? "bg-primary border-primary text-primary-foreground"
                          : index === currentStopIndex
                          ? "bg-accent border-accent text-accent-foreground"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {index < currentStopIndex ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    {index < stops.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          index < currentStopIndex ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          index === currentStopIndex
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stop.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {stop.eta}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stop.address}
                    </p>
                    {stop.students > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {stop.students} học sinh
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}