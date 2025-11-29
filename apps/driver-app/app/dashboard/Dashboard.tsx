// apps/driver-app/src/routes/DashboardPage.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
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

// 1. CẬP NHẬT TỪ ĐIỂN (Thêm phần Weekly)
const TRANSLATIONS = {
  vi: {
    hello: "Xin chào",
    viewMode: "Chế độ xem",
    viewModeDesc: "Chọn xem theo ngày hiện tại hoặc toàn bộ tuần.",
    daily: "Theo ngày",
    weekly: "Theo tuần",
    morning: "Ca sáng",
    afternoon: "Ca chiều",
    weekOf: "Tuần từ",
    to: "đến",
    status: "Trạng thái",
    scheduled: "Dự kiến",
    in_progress: "Đang chạy",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    noTrips: "Không có chuyến đi nào.",
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
    loading: "Đang tải dữ liệu...",
    errorTitle: "Không có dữ liệu.",
    reload: "Tải lại trang",
    loadNotiFail: "Lỗi tải thông báo:",
    loadScheduleFail: "Lỗi tải lịch trình:",
    errorLoad: "Không thể tải lịch trình.",
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
    viewModeDesc: "Switch between daily view or weekly view.",
    daily: "Daily",
    weekly: "Weekly",
    morning: "Morning",
    afternoon: "Afternoon",
    weekOf: "Week of",
    to: "to",
    status: "Status",
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    noTrips: "No trips scheduled.",
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
    loading: "Loading data...",
    errorTitle: "No data available.",
    reload: "Reload Page",
    loadNotiFail: "Load notifications failed:",
    loadScheduleFail: "Load schedule failed:",
    errorLoad: "Unable to load schedule.",
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
  shift: string;
  route: string;
  startTime: string;
  vehicle: string;
  totalStudents: number;
  pickedUp: number;
  droppedOff: number;
  remaining: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

// Interface mới cho Weekly
interface TripItem {
  id: string;
  tripDate: string;
  session: "morning" | "afternoon";
  type: "pickup" | "dropoff";
  route: string;
  startTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  busLicense: string;
}

type ViewMode = "morning" | "afternoon";

const getDefaultViewMode = (): ViewMode => {
  const hourLocal = new Date().getHours();
  return hourLocal < 12 ? "morning" : "afternoon";
};

// Util timeAgo
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

  const [language] = useState<'vi' | 'en'>(() => {
    const saved = localStorage.getItem("language");
    return saved === 'en' ? 'en' : 'vi';
  });

  const t = TRANSLATIONS[language];

  // --- STATE ---
  const [viewScope, setViewScope] = useState<"daily" | "weekly">("daily"); // State mới: Chọn Ngày hay Tuần
  
  const [weeklyData, setWeeklyData] = useState<TripItem[]>([]);
  const [shiftData, setShiftData] = useState<ShiftData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [driverName, setDriverName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mode, setMode] = useState<ViewMode>(getDefaultViewMode);
  
  // State loading riêng để tránh giật cục khi chuyển tab lớn
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // Helper tính ngày trong tuần
  const getWeekRange = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(date);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  useEffect(() => {
    const onUpdated = () => setVersion(v => v + 1);
    window.addEventListener("attendance-updated", onUpdated as EventListener);
    return () => window.removeEventListener("attendance-updated", onUpdated as EventListener);
  }, []);

  const badgeLabel = mode === "morning" ? t.morning : t.afternoon;

  // Notifications: load once on mount (or when version changes)
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (e) {
      console.warn(t.loadNotiFail, e);
    }
  }, [t]);

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated");
    const name = localStorage.getItem("driver_name") || "Tài xế";

    if (!authenticated) {
      navigate("/");
      return;
    }

    setDriverName(name);
    fetchNotifications();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [navigate, fetchNotifications]);

  // Format helper for API dates
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // FETCH DAILY (separated)
  const fetchDailySchedule = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setError(null);
    setLoadingDaily(true);
    try {
      const params = { shift: mode === "morning" ? "pickup" : "dropoff" };
      const res = await axios.get(`${API_URL}/schedule/today`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setShiftData(res.data || null);
    } catch (e) {
      setShiftData(null);
    } finally {
      setLoadingDaily(false);
    }
  }, [mode]);

  // FETCH WEEKLY (separated)
  const fetchWeeklySchedule = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setError(null);
    setLoadingWeekly(true);
    try {
      const { start, end } = getWeekRange(new Date());
      const res = await axios.get(`${API_URL}/schedule/range`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: formatDate(start),
          endDate: formatDate(end),
        },
      });
      setWeeklyData(res.data || []);
    } catch (e) {
      console.error("Load weekly failed:", e);
      setWeeklyData([]);
    } finally {
      setLoadingWeekly(false);
    }
  }, []);

  // useEffect riêng cho từng viewScope để tránh reload không cần thiết
  useEffect(() => {
    if (viewScope !== "daily") return;
    fetchDailySchedule();
  }, [viewScope, fetchDailySchedule, version]);

  useEffect(() => {
    if (viewScope !== "weekly") return;
    fetchWeeklySchedule();
  }, [viewScope, fetchWeeklySchedule, version]);

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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header (Luôn hiển thị để không bị giật layout phía trên) */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t.hello}, {driverName}</h1>
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

  {/* --- KHỐI CHUYỂN ĐỔI CHẾ ĐỘ XEM --- */}
  {/* Bỏ Card bao ngoài để giao diện thoáng hơn, Tabs tự đứng một mình */}
  <Tabs value={viewScope} onValueChange={(v) => setViewScope(v as "daily" | "weekly")} className="w-full">
    
{/* Tabs Lớn: Ngày vs Tuần (Style Viên thuốc + Màu sắc + Hiệu ứng nảy) */}
    <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 gap-2 bg-transparent border border-border/60 rounded-full mb-6 shadow-lg">
      <TabsTrigger 
        value="daily" 
        className="
          rounded-full py-2 
          /* Màu Emerald (Xanh ngọc) cho Daily */
          data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm
          /* Hiệu ứng NẢY */
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          active:scale-95 hover:scale-[1.02]
        "
      >
        {t.daily}
      </TabsTrigger>
      <TabsTrigger 
        value="weekly" 
        className="
          rounded-full py-2 
          /* Màu Violet (Tím) cho Weekly */
          data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 data-[state=active]:shadow-sm
          /* Hiệu ứng NẢY */
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          active:scale-95 hover:scale-[1.02]
        "
      >
        {t.weekly}
      </TabsTrigger>
    </TabsList>
    

    {/* Container giữ chiều cao để tránh giật layout */}
    <div className="min-h-[300px] transition-all">

      {/* === NỘI DUNG NGÀY (DAILY) === */}
      <TabsContent value="daily" className="space-y-6 mt-0 animate-in fade-in-50 zoom-in-95 duration-300">
        


        {/* Tabs Nhỏ: Sáng vs Chiều (Style Viên thuốc màu) */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as ViewMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 gap-2 bg-transparent border border-border/60 rounded-full shadow-lg">
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
        </Tabs>

        {/* LOGIC HIỂN THỊ */}
        {loadingDaily ? (
          <div className="h-[300px] flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground animate-pulse">{t.loading}</p>
          </div>
        ) : !shiftData ? (
          <div className="text-center py-10 bg-accent/5 rounded-2xl border border-dashed border-border min-h-[300px] flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
            <p className="text-muted-foreground mb-2">{t.errorTitle}</p>
            <Button variant="link" onClick={() => setVersion(v => v+1)}>{t.reload}</Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Main Trip Card */}
            <Card className="border-primary/20 shadow-lg shadow-primary/5 rounded-xl overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex justify-between items-center">
                 <div>
                    <h3 className="font-bold text-lg text-primary">{t.todayShift}</h3>
                    <p className="text-xs text-muted-foreground">{t.tripInfo}</p>
                 </div>
                 <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">{badgeLabel}</Badge>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.route}</p>
                    <p className="text-base font-semibold text-foreground line-clamp-1">{shiftData.route}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.startTime}</p>
                    <p className="text-base font-semibold text-foreground">{shiftData.startTime}</p>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.vehicle}</p>
                    <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg w-fit">
<svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  {/* Thân xe */}
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h13a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
  {/* Bánh xe */}
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18v2" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18v2" />
  {/* Cửa sổ & Chi tiết */}
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v5" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7v5" />
</svg>                        <p className="text-sm font-medium text-foreground">{shiftData.vehicle}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isMorning ? t.pickupProgress : t.dropoffProgress}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {doneCount}/{shiftData.totalStudents}
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full bg-primary transition-all duration-500 ease-out ${widthClass}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-border/60 shadow-sm rounded-xl pt-4">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{shiftData.totalStudents}</div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase mt-1">{t.total}</div>
                </CardContent>
              </Card>
              <Card className={`border shadow-sm rounded-xl ${isMorning ? 'border-sky-100 bg-sky-50/30' : 'border-emerald-100 bg-emerald-50/30'}`}>
                <CardContent className="p-4 text-center pt-4">
                  <div className={`text-2xl font-bold ${isMorning ? 'text-sky-600' : 'text-emerald-600'}`}>{doneCount}</div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase mt-1">
                    {isMorning ? t.pickedUp : t.droppedOff}
                  </div>
                </CardContent>
              </Card>
              <Card className={`border shadow-sm rounded-xl ${shiftData.remaining > 0 ? 'border-amber-100 bg-amber-50/30' : 'border-border/60'}`}>
                <CardContent className="p-4 text-center pt-4">
                  <div className={`text-2xl font-bold ${shiftData.remaining > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>{shiftData.remaining}</div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase mt-1">{t.remaining}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-border/60 shadow-sm rounded-xl p-6">
                          <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold text-muted-foreground px-1">{t.quickActions}</h4>
                <Button onClick={handleStartTrip} className="w-full bg-primary text-primary-foreground h-12 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all">
                  {t.startTrip}
                </Button>
                <div className="grid grid-cols-2 gap-3">
<Button 
  onClick={handleViewStudents} 
  variant="outline" 
  className="
    h-12 rounded-xl gap-2 transition-all duration-300
    border-border text-foreground bg-background
    /* Hiệu ứng Hover: Viền sáng lên màu xanh (primary), nền hơi xám nhẹ, nổi lên xíu */
hover:border-primary/50 hover:bg-accent hover:text-accent-foreground  "
>
  {/* Icon Graduation Cap (Đại diện cho Học sinh) */}
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>

  {t.students}
</Button>
<Button 
  onClick={handleReportIncident} 
  variant="outline" 
  className="
    h-12 rounded-xl gap-2 transition-all duration-300
    border-destructive/30 text-destructive bg-background
    /* Hiệu ứng Hover: Đổi nền đỏ, chữ trắng, viền đỏ, bóng đổ và hơi to lên */
    hover:bg-destructive hover:text-white hover:border-destructive
  "
>
  {/* Icon Alert Triangle (Cảnh báo) */}
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
  
  {t.reportIncident}
</Button>
                </div>
            </div>
            </Card>
          </div>
        )}
      </TabsContent>

{/* === NỘI DUNG TUẦN (WEEKLY) === */}
{/* === NỘI DUNG TUẦN (WEEKLY) === */}
      <TabsContent value="weekly" className="mt-0 animate-in fade-in-50 zoom-in-95 duration-300">
        <div className="space-y-5">
          
          {/* 1. Gắn rounded-xl cho cái thanh hiển thị ngày tháng ở trên cùng */}
          <div className="text-center text-sm font-medium text-muted-foreground bg-accent/10 py-2 border border-accent/20 rounded-xl">
            {t.weekOf} {getWeekRange(new Date()).start.toLocaleDateString(language==='vi'?'vi-VN':'en-US')} - {getWeekRange(new Date()).end.toLocaleDateString(language==='vi'?'vi-VN':'en-US')}
          </div>

          {loadingWeekly ? (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-3">
               <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
               <p className="text-sm text-muted-foreground">{t.loading}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const startOfWeek = getWeekRange(new Date()).start;
                const currentDate = new Date(startOfWeek);
                currentDate.setDate(startOfWeek.getDate() + offset);
                
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;
                const isToday = new Date().toDateString() === currentDate.toDateString();
                const tripsOfDay = weeklyData.filter(t => t.tripDate === dateStr);

                return (
                  // 2. Gắn rounded-xl vào đây (Thẻ Card của từng ngày)
                  <Card key={dateStr} className={`group overflow-hidden rounded-xl transition-all duration-300 ${isToday ? 'border-primary/60 ring-1 ring-primary/20 shadow-md bg-primary/[0.02]' : 'border-border/60 shadow-sm'}`}>
                    
                    {/* Header Ngày */}
                    <div className={`px-4 py-2 text-sm flex justify-between items-center border-b ${isToday ? 'border-primary/10 bg-primary/5' : 'border-border/30 bg-muted/20'}`}>
                      <span className={`font-semibold capitalize ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {currentDate.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                      </span>
                      {isToday && <Badge className="text-[10px] px-2 h-5 bg-primary/10 text-primary border-primary/20 shadow-none hover:bg-primary/20">Hôm nay</Badge>}
                    </div>
                    
                    {/* Danh sách chuyến */}
                    <div className="divide-y divide-border/30">
                      {tripsOfDay.length === 0 ? (
                        <div className="py-4 text-center text-xs text-muted-foreground italic opacity-70">{t.noTrips}</div>
                      ) : (
                        tripsOfDay.map(trip => {
                            const isMorning = trip.session === 'morning';
                            // Ép kiểu any để lấy stops không bị báo lỗi đỏ
                            const stops = (trip as any).stops || [];

                            return (
                                <div key={trip.id} className="flex flex-col hover:bg-muted/30 transition-colors">
                                  {/* Phần Header Chuyến */}
                                  <div className="p-3 pb-2 flex items-start gap-3">
                                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${isMorning ? 'bg-orange-400' : 'bg-blue-400'}`} />
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-semibold text-foreground truncate">{trip.route}</p>
                                        <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 ml-2 ${trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {t[trip.status] || trip.status}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                          <span className={`font-medium ${isMorning ? 'text-orange-600' : 'text-blue-600'}`}>
                                              {isMorning ? (language==='vi'?'SÁNG':'MORNING') : (language==='vi'?'CHIỀU':'AFTERNOON')}
                                          </span>
                                          <span>•</span>
                                          <span>{trip.startTime}</span>
                                          <span>•</span>
                                          <span>{trip.busLicense}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* --- PHẦN HIỂN THỊ LỘ TRÌNH (STOPS) --- */}
                                  {stops.length > 0 && (
                                    <div className="mx-3 mb-3 ml-7 pl-3 border-l-2 border-border/40 space-y-3 pt-1">
                                      {stops.map((stop: any, idx: number) => (
                                        <div key={stop.id} className="relative flex items-start group/stop">
                                          <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground/30 ring-2 ring-background group-hover/stop:bg-primary transition-colors" />
                                          <div className="text-xs">
                                            <span className="font-medium text-foreground/90">{stop.name}</span>
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{stop.address}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                            );
                        })
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </TabsContent>

    </div>
  </Tabs>

  {/* Notifications (Giữ nguyên nhưng tinh chỉnh border nhẹ nhàng hơn) */}
  <Card className="border-border/50 rounded-xl shadow-sm">
    <CardHeader className="pb-3 pt-5">
      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {t.notifications}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t.noNotifications}</p>
      ) : notifications.map(n => (
        <div key={n.id} className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors">
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{n.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{timeAgo(n.createdAt, language)}</p>
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
