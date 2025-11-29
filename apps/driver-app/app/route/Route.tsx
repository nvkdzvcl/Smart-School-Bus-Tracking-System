// apps/driver-app/src/route/Route.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/Tabs";

import { MobileNav } from "../../components/MobileNav";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 1. Định nghĩa từ điển ngôn ngữ
const TRANSLATIONS = {
  vi: {
    routeTitle: "Lộ trình",
    defaultRouteName: "Chưa có tên tuyến",
    morning: "Ca sáng",
    afternoon: "Ca chiều",
    gpsMap: "Bản đồ GPS",
    startTrip: "Bắt đầu chuyến",
    pauseTrip: "Tạm dừng",
    resumeTrip: "Tiếp tục",
    directions: "Chỉ đường",
    attendance: "Điểm danh / DS Học sinh",
    backToDashboard: "Quay về Bảng tin",
    
    // Status badges
    statusScheduled: "Chưa bắt đầu",
    statusInProgress: "Đang chạy",
    statusPaused: "Tạm dừng",
    statusCompleted: "Đã hoàn thành",

    // Stop info
    tripCompletedLabel: "Chuyến đã hoàn thành",
    currentStop: "Điểm hiện tại",
    nextStop: "Điểm tiếp theo",
    routeEnded: "Lộ trình đã kết thúc",
    students: "học sinh",
    
    // Times
    actualStart: "Bắt đầu thực tế",
    actualEnd: "Kết thúc thực tế",
    routeProgress: "Tiến độ tuyến",

    // Loading / Errors
    loading: "Đang tải chi tiết lộ trình...",
    errorLoad: "Không thể tải chi tiết lộ trình. Vui lòng thử lại.",
    errorNoData: "Không tìm thấy dữ liệu chuyến đi.",
    errorStart: "Không thể bắt đầu chuyến đi. Vui lòng thử lại.",
    errorCoords: "Tọa độ không hợp lệ",
  },
  en: {
    routeTitle: "Route",
    defaultRouteName: "Unnamed Route",
    morning: "Morning",
    afternoon: "Afternoon",
    gpsMap: "GPS Map",
    startTrip: "Start Trip",
    pauseTrip: "Pause",
    resumeTrip: "Resume",
    directions: "Directions",
    attendance: "Attendance / Students",
    backToDashboard: "Back to Dashboard",

    // Status badges
    statusScheduled: "Scheduled",
    statusInProgress: "In Progress",
    statusPaused: "Paused",
    statusCompleted: "Completed",

    // Stop info
    tripCompletedLabel: "Trip Completed",
    currentStop: "Current Stop",
    nextStop: "Next Stop",
    routeEnded: "Route Ended",
    students: "students",

    // Times
    actualStart: "Actual Start",
    actualEnd: "Actual End",
    routeProgress: "Route Progress",

    // Loading / Errors
    loading: "Loading route details...",
    errorLoad: "Unable to load route details. Please try again.",
    errorNoData: "No trip data found.",
    errorStart: "Unable to start trip. Please try again.",
    errorCoords: "Invalid coordinates",
  },
};

interface Stop {
  id: string;
  name: string;
  address: string;
  students: number;
  status: "pending" | "current" | "completed";
  eta: string;
  lat: number | string;
  lng: number | string;
}

type TripStatusBE = "scheduled" | "in_progress" | "completed" | "cancelled";
type TripStatusFE = TripStatusBE | "paused";

type TabKey = "morning" | "afternoon"; // UI
type ShiftKey = "pickup" | "dropoff";   // BE

const getDefaultTab = (): TabKey => {
  const hourLocal = new Date().getHours();
  return hourLocal < 12 ? "morning" : "afternoon";
};

export default function RoutePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 2. Khởi tạo Language State
  const [language] = useState<'vi' | 'en'>(() => {
    const saved = localStorage.getItem("language");
    return saved === 'en' ? 'en' : 'vi';
  });
  const t = TRANSLATIONS[language];

  // NEW: state chọn ca
  const [tab, setTab] = useState<TabKey>(getDefaultTab);
  const apiShift: ShiftKey = tab === "morning" ? "pickup" : "dropoff";

  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [tripStatus, setTripStatus] = useState<TripStatusFE>("scheduled");

  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tripTimes, setTripTimes] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  
  // === Utils
  const toNumber = (v: number | string) =>
    typeof v === "string" ? Number(v.replace(",", ".")) : v;

  // --- Lấy current stop / index ---
  const { currentStop, currentStopIndex } = useMemo(() => {
    const idx = stops.findIndex((s) => s.status === "current");
    if (idx !== -1) return { currentStop: stops[idx], currentStopIndex: idx };

    if (tripStatus === "in_progress" && stops.length > 0) {
      const lastIndex = stops.length - 1;
      return { currentStop: stops[lastIndex], currentStopIndex: lastIndex };
    }
    return { currentStop: stops[0], currentStopIndex: 0 };
  }, [stops, tripStatus]);

  // --- Fetch details ---
  const fetchRouteDetails = useCallback(async (token: string) => {
    try {
      // Vì logic fetch nằm trong callback, ta cần lấy language hiện tại để set error message đúng ngôn ngữ
      // Tuy nhiên t đã được closure ở trên. Để an toàn, ta dùng t từ scope component.
      
      const response = await axios.get(`${API_URL}/schedule/active-trip-details`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { shift: apiShift },
      });

      setTripTimes({
        start: response.data.actualStartTime || null,
        end: response.data.actualEndTime || null,
      });

      setStops(
        (response.data.stops || []).map((s: any) => ({
          ...s,
          lat: toNumber(s.lat),
          lng: toNumber(s.lng),
        }))
      );
      setTripStatus(response.data.tripStatus);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết lộ trình:", err);
      // Sử dụng t.errorLoad ở đây cần cẩn thận nếu t thay đổi.
      // Nhưng vì fetchRouteDetails phụ thuộc vào apiShift (tab change), component sẽ re-render
      // nên t sẽ được cập nhật.
      setError("FAILED_LOAD"); // Hack nhẹ: set mã lỗi rồi render ra text sau, hoặc dùng state language trong deps
    } finally {
      setIsLoading(false);
    }
  }, [apiShift]); 

  // Handle Error Message Display
  // Nếu error state là mã đặc biệt, hiển thị text tương ứng
  const displayError = error === "FAILED_LOAD" ? t.errorLoad : error;

  // Vào trang → fetch
  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated");
    const token = localStorage.getItem("access_token");
    if (!authenticated || !token) {
      navigate("/");
      return;
    }
    fetchRouteDetails(token);
  }, [navigate, fetchRouteDetails, location.key]);

  // Lắng nghe sự kiện
  useEffect(() => {
    const onUpdated = () => {
      const token = localStorage.getItem("access_token");
      if (token) fetchRouteDetails(token);
    };
    
    window.addEventListener("attendance-updated", onUpdated as EventListener);
    window.addEventListener("trip-status-updated", onUpdated as EventListener);
    
    return () => {
      window.removeEventListener("attendance-updated", onUpdated as EventListener);
      window.removeEventListener("trip-status-updated", onUpdated as EventListener);
    };
  }, [fetchRouteDetails]);

  // Mô phỏng tốc độ
  useEffect(() => {
    const speedInterval = setInterval(() => {
      if (tripStatus === "in_progress") {
        setCurrentSpeed(Math.floor(Math.random() * 40) + 20);
      } else {
        setCurrentSpeed(0);
      }
    }, 2000);
    return () => clearInterval(speedInterval);
  }, [tripStatus]);

  // Start / Pause / Resume
  const handleStartTrip = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/");
    try {
      const response = await axios.patch(
        `${API_URL}/schedule/start-trip`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { shift: apiShift },
        }
      );
      setTripStatus(response.data.newStatus);
      await fetchRouteDetails(token);
    } catch (err: any) {
      console.error("Lỗi khi bắt đầu chuyến:", err);
      if (axios.isAxiosError(err) && err.response) {
        alert(err.response.data.message || t.errorStart);
      } else {
        alert(t.errorStart);
      }
    }
  };

  const handlePauseTrip = () => setTripStatus("paused");
  const handleResumeTrip = () => setTripStatus("in_progress");

  // Open Google Maps
  const openMapsDirections = (destLat: number | string, destLng: number | string) => {
    const lat = toNumber(destLat);
    const lng = toNumber(destLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.error("Lat/Lng invalid:", destLat, destLng);
      alert(t.errorCoords);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const oLat = pos.coords.latitude;
          const oLng = pos.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLng}&destination=${lat},${lng}&travelmode=driving`;
          window.open(url, "_blank");
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
          window.open(url, "_blank");
        },
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(url, "_blank");
    }
  };

  const handleNavigate = () => {
    if (!currentStop) return;
    openMapsDirections(currentStop.lat, currentStop.lng);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">{t.loading}</p>
      </div>
    );
  }

  if (error || !currentStop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <p className="text-destructive mb-4">{displayError || t.errorNoData}</p>
        <Button onClick={() => navigate("/dashboard")}>{t.backToDashboard}</Button>
      </div>
    );
  }

  const getBadgeText = () => {
    if (tripStatus === "in_progress") return t.statusInProgress;
    if (tripStatus === "paused") return t.statusPaused;
    if (tripStatus === "completed") return t.statusCompleted;
    return t.statusScheduled;
  };

  const getBadgeClass = () => {
    if (tripStatus === "in_progress") return "bg-primary text-primary-foreground";
    if (tripStatus === "paused") return "bg-destructive text-destructive-foreground";
    if (tripStatus === "completed") return "bg-emerald-500 text-emerald-50"; 
    return "bg-secondary text-secondary-foreground border border-border/50";
  };

  // Đếm số stop đã hoàn thành
  const doneStops = stops.filter((s) => s.status === "completed").length;
  const hasCurrent = stops.some((s) => s.status === "current");
  const progressCount = Math.min(doneStops + (hasCurrent ? 1 : 0), stops.length);

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
                className="text-foreground hover:bg-muted/70"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{t.routeTitle}</h1>
                <p className="text-xs text-muted-foreground">{currentStop?.name || t.defaultRouteName}</p>
              </div>
            </div>
            <Badge className={getBadgeClass() + " rounded-full px-3 py-0.5"}>{getBadgeText()}</Badge>
          </div>
        </div>
      </header>

<main className="max-w-lg mx-auto px-4 py-4 space-y-4">

  {/* Tabs giữ nguyên như cũ */}
<Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          className="w-full"
        >
          {/* --- SỬA ĐỔI STYLE Ở ĐÂY --- */}
          <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 gap-2 bg-transparent border border-border/60 rounded-full mb-4">
            <TabsTrigger
              value="morning"
              className="rounded-full py-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm transition-all duration-300"
            >
              {t.morning}
            </TabsTrigger>
            <TabsTrigger
              value="afternoon"
              className="rounded-full py-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-300"
            >
              {t.afternoon}
            </TabsTrigger>
          </TabsList>
          {/* --- HẾT PHẦN SỬA ĐỔI --- */}
        </Tabs>

  {/* --- BẮT ĐẦU PHẦN HIỆU ỨNG --- */}
  {/* Thêm div này bao quanh các Card. key={tab} để reset animation khi đổi tab */}
  <div 
    key={tab} 
    className="space-y-4 animate-in fade-in-50 zoom-in-95 duration-300"
  >

    {/* Bản đồ placeholder + nút */}
    <Card className="border-border/50 overflow-hidden rounded-lg">
      <div className="relative h-64 bg-gradient-to-br from-secondary to-accent/20">
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
            <p className="text-sm text-muted-foreground">{t.gpsMap}</p>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary tabular-nums">{currentSpeed}</div>
            <div className="text-xs text-muted-foreground">km/h</div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 bg-card">
        <div className="flex gap-2">
          {tripStatus === "scheduled" && (
            <Button
              onClick={handleStartTrip}
              className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.startTrip}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.pauseTrip}
              </Button>
              <Button
                onClick={handleNavigate}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {t.directions}
              </Button>
            </>
          )}

          {tripStatus === "paused" && (
            <Button
              onClick={handleResumeTrip}
              className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.resumeTrip}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Current Stop Info */}
    <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 rounded-lg">
      <CardContent className="px-4 pt-6 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-primary text-primary-foreground rounded-lg">
                {tripStatus === "completed"
                  ? t.tripCompletedLabel
                  : currentStop.status === "current"
                  ? t.currentStop
                  : t.nextStop}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground">
              {tripStatus === "completed" ? t.routeEnded : currentStop.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {tripStatus === "completed" ? "" : currentStop.address}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{currentStop.students} {t.students}</span>
          </div>

          <Button
            onClick={() => navigate("/students")}
            size="sm"
            disabled={tripStatus !== "in_progress"}
            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
          >
            {t.attendance}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/50 text-xs">
          <div>
            <p className="text-muted-foreground font-medium">{t.actualStart}</p>
            <p className={`text-sm font-semibold ${tripTimes.start ? 'text-primary' : 'text-muted-foreground/70'}`}>
                {tripTimes.start || '--:--'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">{t.actualEnd}</p>
            <p className={`text-sm font-semibold ${tripTimes.end ? 'text-primary' : 'text-muted-foreground/70'}`}>
                {tripTimes.end || '--:--'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Route Progress */}
    <Card className="border-border/50 rounded-lg">
      <CardContent className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t.routeProgress}</h3>
          <span className="text-sm text-muted-foreground">
            {progressCount}/{stops.length}
          </span>
        </div>

        <div className="mt-4 space-y-0">
          {stops.map((stop, index) => {
            const isDone = stop.status === "completed";
            const isCurrent = stop.status === "current";
            return (
              <div key={stop.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isDone
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-accent border-accent text-accent-foreground"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < stops.length - 1 && (
                    <div className={`w-0.5 h-9 ${stop.status !== "pending" ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                      {stop.name}
                    </p>
                    <span className="text-xs text-muted-foreground">{stop.eta}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stop.address}</p>
                  {stop.students > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{stop.students} {t.students}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>

  </div>
  {/* --- KẾT THÚC PHẦN HIỆU ỨNG --- */}

</main>

      <MobileNav />
    </div>
  );
}