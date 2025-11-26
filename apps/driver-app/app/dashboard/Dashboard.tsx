// apps/driver-app/src/routes/DashboardPage.tsx

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { MobileNav } from "../../components/MobileNav";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/Tabs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 1. Định nghĩa từ điển ngôn ngữ
const TRANSLATIONS = {
  vi: {
    hello: "Xin chào",
    viewMode: "Chế độ xem",
    viewModeDesc: "Mặc định hiển thị theo ca (sáng/chiều) theo giờ hiện tại.",
    morning: "Ca sáng",
    afternoon: "Ca chiều",
    todayShift: "Ca làm việc hôm nay",
    tripInfo: "Thông tin chuyến đi",
    route: "Tuyến đường",
    startTime: "Thời gian bắt đầu",
    vehicle: "Phương tiện",
    pickupProgress: "Tiến độ đón học sinh",
    dropoffProgress: "Tiến độ trả học sinh",
    total: "Tổng số",
    pickedUp: "Đã đón",
    droppedOff: "Đã trả",
    remaining: "Còn lại",
    quickActions: "Thao tác nhanh",
    startTrip: "Bắt đầu hành trình",
    students: "Học sinh",
    reportIncident: "Báo sự cố",
    notifications: "Thông báo",
    noNotifications: "Không có thông báo mới.",
    loading: "Đang tải lịch trình...",
    errorTitle: "Không có dữ liệu lịch trình.",
    reload: "Tải lại trang",
    loadNotiFail: "Load notifications failed:",
    loadScheduleFail: "Load schedule failed:",
    errorLoad: "Không thể tải lịch trình. Vui lòng thử lại.",
    yearsAgo: " năm trước",
    monthsAgo: " tháng trước",
    daysAgo: " ngày trước",
    hoursAgo: " giờ trước",
    minsAgo: " phút trước",
    secsAgo: " giây trước",
  },
  en: {
    hello: "Hello",
    viewMode: "View Mode",
    viewModeDesc: "Default display by shift (morning/afternoon) based on current time.",
    morning: "Morning",
    afternoon: "Afternoon",
    todayShift: "Today's Shift",
    tripInfo: "Trip Information",
    route: "Route",
    startTime: "Start Time",
    vehicle: "Vehicle",
    pickupProgress: "Pickup Progress",
    dropoffProgress: "Drop-off Progress",
    total: "Total",
    pickedUp: "Picked Up",
    droppedOff: "Dropped Off",
    remaining: "Remaining",
    quickActions: "Quick Actions",
    startTrip: "Start Trip",
    students: "Students",
    reportIncident: "Report Incident",
    notifications: "Notifications",
    noNotifications: "No new notifications.",
    loading: "Loading schedule...",
    errorTitle: "No schedule data available.",
    reload: "Reload Page",
    loadNotiFail: "Load notifications failed:",
    loadScheduleFail: "Load schedule failed:",
    errorLoad: "Unable to load schedule. Please try again.",
    yearsAgo: " years ago",
    monthsAgo: " months ago",
    daysAgo: " days ago",
    hoursAgo: " hours ago",
    minsAgo: " mins ago",
    secsAgo: " secs ago",
  },
};

// ---- Types ----
interface ShiftData {
  shift: string;           // "Ca sáng" | "Ca chiều"
  route: string;
  startTime: string;
  vehicle: string;
  totalStudents: number;
  pickedUp: number;        // sáng
  droppedOff: number;      // chiều
  remaining: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

type ViewMode = "morning" | "afternoon";

const getDefaultViewMode = (): ViewMode => {
  const hourLocal = new Date().getHours();
  return hourLocal < 12 ? "morning" : "afternoon";
};

// 2. Cập nhật util timeAgo để hỗ trợ đa ngôn ngữ
function timeAgo(dateString: string, lang: 'vi' | 'en'): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const t = TRANSLATIONS[lang];

  let i = seconds / 31536000; if (i > 1) return Math.floor(i) + t.yearsAgo;
  i = seconds / 2592000; if (i > 1) return Math.floor(i) + t.monthsAgo;
  i = seconds / 86400; if (i > 1) return Math.floor(i) + t.daysAgo;
  i = seconds / 3600; if (i > 1) return Math.floor(i) + t.hoursAgo;
  i = seconds / 60; if (i > 1) return Math.floor(i) + t.minsAgo;
  return Math.floor(seconds) + t.secsAgo;
}

const widthPercentClasses: Record<number, string> = {
  0: "w-[0%]", 10: "w-[10%]", 20: "w-[20%]", 30: "w-[30%]", 40: "w-[40%]",
  50: "w-[50%]", 60: "w-[60%]", 70: "w-[70%]", 80: "w-[80%]", 90: "w-[90%]", 100: "w-[100%]",
};

export default function DashboardPage() {
  const navigate = useNavigate();

  // 3. Khởi tạo Language State từ localStorage
  const [language] = useState<'vi' | 'en'>(() => {
    const saved = localStorage.getItem("language");
    return saved === 'en' ? 'en' : 'vi';
  });
  
  // Helper lấy từ điển
  const t = TRANSLATIONS[language];

  const [driverName, setDriverName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mode, setMode] = useState<ViewMode>(getDefaultViewMode);
  const [shiftData, setShiftData] = useState<ShiftData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onUpdated = () => setVersion(v => v + 1);
    window.addEventListener("attendance-updated", onUpdated as EventListener);
    return () => window.removeEventListener("attendance-updated", onUpdated as EventListener);
  }, []);

  // Label hiển thị badge (Dịch dựa trên mode)
  const badgeLabel = mode === "morning" ? t.morning : t.afternoon;

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated");
    const name = localStorage.getItem("driver_name") || "Tài xế";
    const token = localStorage.getItem("access_token");

    if (!authenticated || !token) {
      navigate("/");
      return;
    }

    setDriverName(name);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data || []);
      } catch (e) {
        console.warn(t.loadNotiFail, e);
      }
    };

    const fetchSchedule = async () => {
      setError(null);
      try {
        const params = {
          shift: mode === "morning" ? "pickup" : "dropoff"
        };

        const res = await axios.get(`${API_URL}/schedule/today`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setShiftData(res.data as ShiftData);
      } catch (e) {
        console.error(t.loadScheduleFail, e);
        setShiftData(null);
        setError(t.errorLoad);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
    fetchNotifications();

    return () => clearInterval(timer);
  }, [navigate, mode, version, t]); // thêm t vào dependency để re-run khi đổi lang (nếu cần)

  const isMorning = mode === "morning";

  const doneCount = useMemo(() => {
    if (!shiftData) return 0;
    return isMorning ? shiftData.pickedUp : (shiftData.droppedOff ?? 0);
  }, [shiftData, isMorning]);

  const progressPct = useMemo(() => {
    if (!shiftData || shiftData.totalStudents === 0) return 0;
    return Math.max(0, Math.min(100, Math.round((doneCount / shiftData.totalStudents) * 100)));
  }, [shiftData, doneCount]);

  const widthClass = widthPercentClasses[Math.round(progressPct / 10) * 10] ?? "w-[0%]";

  const handleStartTrip = () => navigate("/route");
  const handleViewStudents = () => navigate("/students");
  const handleReportIncident = () => navigate("/incidents");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">{t.loading}</p>
      </div>
    );
  }

  if (error || !shiftData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <p className="text-destructive mb-4">{error || t.errorTitle}</p>
        <Button onClick={() => window.location.reload()}>{t.reload}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t.hello}, {driverName}</h1>
              {/* Định dạng ngày theo locale */}
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString(language === 'vi' ? "vi-VN" : "en-US", { 
                    weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary tabular-nums">
                {currentTime.toLocaleTimeString(language === 'vi' ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Chọn chế độ xem */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground">{t.viewMode}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t.viewModeDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as ViewMode)} className="w-full">
              <TabsList className="grid grid-cols-2 rounded-lg">
                <TabsTrigger value="morning" className="rounded-lg">{t.morning}</TabsTrigger>
                <TabsTrigger value="afternoon" className="rounded-lg">{t.afternoon}</TabsTrigger>
              </TabsList>
              <TabsContent value="morning" />
              <TabsContent value="afternoon" />
            </Tabs>
          </CardContent>
        </Card>

        {/* Thẻ lịch trình hiện tại */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/10 rounded-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">{t.todayShift}</CardTitle>
              <Badge className="bg-primary text-primary-foreground rounded-lg">{badgeLabel}</Badge>
            </div>
            <CardDescription className="text-muted-foreground">{t.tripInfo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t.route}</p>
                <p className="text-sm font-medium text-foreground">{shiftData.route}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t.startTime}</p>
                <p className="text-sm font-medium text-foreground">{shiftData.startTime}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground">{t.vehicle}</p>
                <p className="text-sm font-medium text-foreground">{shiftData.vehicle}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {isMorning ? t.pickupProgress : t.dropoffProgress}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {doneCount}/{shiftData.totalStudents}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full bg-primary transition-all duration-300 ${widthClass}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/50 rounded-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-foreground">{shiftData.totalStudents}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.total}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 rounded-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{doneCount}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isMorning ? t.pickedUp : t.droppedOff}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 rounded-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-accent">{shiftData.remaining}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.remaining}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleStartTrip}
              className="w-full bg-primary text-primary-foreground h-12 text-base rounded-lg transition-all duration-200 shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.startTrip}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleViewStudents}
                variant="outline"
                className="h-12 border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t.students}
              </Button>

              <Button
                onClick={handleReportIncident}
                variant="outline"
                className="h-12 border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent rounded-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                {t.reportIncident}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t.notifications}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">{t.noNotifications}</p>
            ) : notifications.map(n => (
              <div key={n.id} className="group flex items-start gap-3 p-3 rounded-lg bg-accent/15 border border-accent/30">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  {/* Truyền ngôn ngữ vào hàm timeAgo */}
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt, language)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}