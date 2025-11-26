// apps/driver-app/src/routes/students/StudentsPage.tsx

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { MobileNav } from "../../components/MobileNav";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- 1. TRANSLATIONS ---
const TRANSLATIONS = {
  vi: {
    studentList: "Danh sách học sinh",
    searchPlaceholder: "Tìm kiếm học sinh...",
    viewMode: "Chế độ xem",
    daily: "Theo ngày",
    weekly: "Theo tuần",
    weekOf: "Tuần từ",
    to: "đến",
    noTrips: "Không có chuyến đi nào.",
    morning: "Ca sáng",
    afternoon: "Ca chiều",
    startShiftMorning: "Bắt đầu ca sáng",
    startShiftAfternoon: "Bắt đầu ca chiều",
    completeShiftMorning: "Hoàn thành ca sáng",
    completeShiftAfternoon: "Hoàn thành ca chiều",
    
    // Stats
    total: "Tổng",
    pickedUp: "Đã đón",
    droppedOff: "Đã trả",
    remaining: "Còn lại",

    // Status badges / buttons
    statusAttended: "Đã đón", 
    statusAbsent: "Vắng",
    statusPendingPickup: "Chưa đón",
    statusPendingDropoff: "Chưa trả",
    
    btnAttendedPickup: "Đã đón",
    btnAttendedDropoff: "Đã trả",
    btnUndo: "Hoàn tác",

    // Trip Status Translations
    scheduled: "Dự kiến",
    in_progress: "Đang chạy",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",

    // Loading / Error / Empty
    loading: "Đang tải dữ liệu...",
    errorNoData: "Không có dữ liệu.",
    errorLoad: "Không thể tải danh sách.",
    emptyList: "Không tìm thấy học sinh nào.",
    
    // Actions messages
    attendedAt: "Đã đón lúc", 
    attendedAtDropoff: "Đã trả lúc",

    // Errors alert
    errorStart: "Không thể bắt đầu ca.",
    errorComplete: "Không thể hoàn thành ca.",
    errorAttend: "Lỗi điểm danh.",
    errorUndo: "Lỗi hoàn tác.",

    today: "Hôm nay",
    sessionMorning: "SÁNG",
    sessionAfternoon: "CHIỀU",
    labelPickup: "ĐÓN",
    labelDropoff: "TRẢ",
    noStudent: "Không có học sinh",
  },
  en: {
    studentList: "Student List",
    searchPlaceholder: "Search students...",
    viewMode: "View Mode",
    daily: "Daily",
    weekly: "Weekly",
    weekOf: "Week of",
    to: "to",
    noTrips: "No trips scheduled.",
    morning: "Morning",
    afternoon: "Afternoon",
    startShiftMorning: "Start Morning Shift",
    startShiftAfternoon: "Start Afternoon Shift",
    completeShiftMorning: "Complete Morning Shift",
    completeShiftAfternoon: "Complete Afternoon Shift",

    // Stats
    total: "Total",
    pickedUp: "Picked Up",
    droppedOff: "Dropped Off",
    remaining: "Remaining",

    // Status badges / buttons
    statusAttended: "Attended",
    statusAbsent: "Absent",
    statusPendingPickup: "Pending Pickup",
    statusPendingDropoff: "Pending Dropoff",
    
    btnAttendedPickup: "Picked Up",
    btnAttendedDropoff: "Dropped Off",
    btnUndo: "Undo",

    // Trip Status Translations
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",

    // Loading / Error / Empty
    loading: "Loading data...",
    errorNoData: "No data available.",
    errorLoad: "Unable to load list.",
    emptyList: "No students found.",

    // Actions messages
    attendedAt: "Picked up at",
    attendedAtDropoff: "Dropped off at",

    // Errors alert
    errorStart: "Unable to start shift.",
    errorComplete: "Unable to complete shift.",
    errorAttend: "Attendance error.",
    errorUndo: "Undo error.",

    today: "Today",
    sessionMorning: "MORNING",
    sessionAfternoon: "AFTERNOON",
    labelPickup: "PICKUP",
    labelDropoff: "DROPOFF",
    noStudent: "No students",
  },
};

// --- Interfaces ---
interface StudentBE {
  id: string;
  fullName: string;
  address: string;
  status: "pending" | "attended" | "absent" | string;
  attendedAt?: string | null;
}

interface StatsBE {
  total: number;
  pickedUp: number;
  droppedOff: number;
  remaining: number;
}

// Interface cho Weekly View (Nested)
interface WeeklyShift {
  tripId: string;
  session: "morning" | "afternoon";
  type: "pickup" | "dropoff";
  route: string;
  status: string;
  students: StudentBE[];
}

interface DailyGroup {
  date: string; // YYYY-MM-DD
  shifts: WeeklyShift[];
}

type TabKey = "morning" | "afternoon"; // UI
type ShiftKey = "pickup" | "dropoff";   // BE
type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | string;

const getDefaultTab = (): TabKey => {
  const hourLocal = new Date().getHours();
  return hourLocal < 12 ? "morning" : "afternoon";
};

// --- 2. SKELETON COMPONENT (CHỐNG GIẬT) ---
const StudentListSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-3 gap-3">
         <div className="h-20 bg-muted rounded-lg border border-border/50"></div>
         <div className="h-20 bg-muted rounded-lg border border-border/50"></div>
         <div className="h-20 bg-muted rounded-lg border border-border/50"></div>
      </div>
      {/* List Items Skeleton */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="border border-border/50 rounded-lg p-4 flex gap-3 items-start bg-card">
           <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0"></div>
           <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                 <div className="h-4 bg-muted rounded w-1/3"></div>
                 <div className="h-5 bg-muted rounded w-20"></div>
              </div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="flex gap-2 mt-2">
                 <div className="h-8 bg-muted rounded w-full"></div>
                 <div className="h-8 bg-muted rounded w-full hidden"></div>
              </div>
           </div>
        </div>
      ))}
    </div>
  )
}

export default function StudentsPage() {
  const navigate = useNavigate();

  const [language] = useState<'vi' | 'en'>(() => {
    const saved = localStorage.getItem("language");
    return saved === 'en' ? 'en' : 'vi';
  });
  const t = TRANSLATIONS[language];

  // --- STATE ---
  const [viewScope, setViewScope] = useState<"daily" | "weekly">("daily");
  
  // Daily State
  const [tab, setTab] = useState<TabKey>(getDefaultTab);
  const apiShift: ShiftKey = tab === "morning" ? "pickup" : "dropoff";
  const isPickupShift = apiShift === "pickup";

  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentBE[]>([]);
  const [stats, setStats] = useState<StatsBE>({ total: 0, pickedUp: 0, droppedOff: 0, remaining: 0 });
  const [tripStatus, setTripStatus] = useState<TripStatus>("scheduled");

  // Weekly State
  const [weeklyGroups, setWeeklyGroups] = useState<DailyGroup[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const busyIds = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  // Helper tính tuần
  const getWeekRange = (date: Date) => {
    const day = date.getDay(); 
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(date);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  // --- FETCH DAILY ---
  const fetchStudents = useCallback(async () => {
    const authenticated = localStorage.getItem("driver_authenticated");
    const token = localStorage.getItem("access_token");
    if (!authenticated || !token) { navigate("/"); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // 1) Danh sách + thống kê
      const resStudents = await axios.get(`${API_URL}/schedule/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { shift: apiShift },
        signal: abortRef.current.signal as any,
      });
      setStats(resStudents.data.stats);
      setStudents(resStudents.data.students);

      // 2) Trạng thái trip
      const resDetails = await axios.get(`${API_URL}/schedule/active-trip-details`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { shift: apiShift },
        signal: abortRef.current.signal as any,
      });
      setTripStatus(resDetails.data.tripStatus ?? "scheduled");
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      // Xử lý lỗi nhẹ nhàng: nếu 404 (không có chuyến) thì coi như rỗng
      if (axios.isAxiosError(err) && err.response?.status === 404) {
         setStudents([]);
         setStats({ total: 0, pickedUp: 0, droppedOff: 0, remaining: 0 });
      } else {
         setError("ERROR_LOAD");
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiShift, navigate]);

  // --- FETCH WEEKLY (API MỚI) ---
  const fetchWeeklyStudents = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    setIsLoading(true);
    try {
      const { start, end } = getWeekRange(new Date());
      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Gọi endpoint mới: getWeeklyStudents
      const res = await axios.get(`${API_URL}/schedule/weekly-students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: formatDate(start), endDate: formatDate(end) },
      });
      setWeeklyGroups(res.data || []);
    } catch (e) {
      setWeeklyGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect chuyển đổi giữa các mode
  useEffect(() => {
    if (viewScope === 'daily') {
        fetchStudents();
    } else {
        fetchWeeklyStudents();
    }
    return () => abortRef.current?.abort();
  }, [fetchStudents, fetchWeeklyStudents, viewScope]);


  // --- ACTIONS ---
  const handleStartTrip = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      await axios.patch(`${API_URL}/schedule/start-trip`, {}, { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } });
      await fetchStudents();
    } catch (err: any) { alert(err.response?.data?.message || t.errorStart); }
  };

  const handleCompleteTrip = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      await axios.patch(`${API_URL}/schedule/complete-trip`, {}, { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } });
      await fetchStudents();
    } catch (err: any) { alert(err.response?.data?.message || t.errorComplete); }
  };

  const handleAttend = async (studentId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token || busyIds.current.has(studentId)) return;
    busyIds.current.add(studentId);
    try {
      await axios.patch(`${API_URL}/schedule/attend`, { studentId }, { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } });
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: "attended", attendedAt: new Date().toISOString() } : s)));
      setStats(prev => ({ ...prev, remaining: prev.remaining - 1, [isPickupShift ? 'pickedUp' : 'droppedOff']: prev[isPickupShift ? 'pickedUp' : 'droppedOff'] + 1 }));
    } catch (err: any) { alert(t.errorAttend); } finally { busyIds.current.delete(studentId); }
  };

  const handleUndoAttend = async (studentId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token || busyIds.current.has(studentId)) return;
    busyIds.current.add(studentId);
    try {
      await axios.patch(`${API_URL}/schedule/undo-attend`, { studentId }, { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } });
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: "pending", attendedAt: null } : s)));
      setStats(prev => ({ ...prev, remaining: prev.remaining + 1, [isPickupShift ? 'pickedUp' : 'droppedOff']: prev[isPickupShift ? 'pickedUp' : 'droppedOff'] - 1 }));
    } catch (err: any) { alert(t.errorUndo); } finally { busyIds.current.delete(studentId); }
  };

  // Filter Daily List
  const filteredStudents = useMemo(
    () => students.filter((s) => s.fullName.toLowerCase().includes(searchQuery.toLowerCase())),
    [students, searchQuery]
  );

  // Render: Daily List
  const renderDailyList = () => {
    if (filteredStudents.length === 0) {
      return (
        <Card className="border-border/50 rounded-lg">
          <CardContent className="p-8 text-center"><p className="text-muted-foreground">{t.emptyList}</p></CardContent>
        </Card>
      );
    }

    return filteredStudents.map((student) => {
      const isBusy = busyIds.current.has(student.id);
      const isPickup = apiShift === "pickup";
      const attendedTime = student.status === "attended" && student.attendedAt
          ? new Date(student.attendedAt).toLocaleTimeString(language === 'vi' ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" }) : null;

      let badgeText = "";
      if (student.status === "attended") badgeText = isPickup ? t.btnAttendedPickup : t.btnAttendedDropoff;
      else if (student.status === "absent") badgeText = t.statusAbsent;
      else badgeText = isPickup ? t.statusPendingPickup : t.statusPendingDropoff;

      return (
        <Card key={student.id} className="border-border/50 rounded-lg">
          <CardContent className="p-4 px-5 pt-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-secondary-foreground">{student.fullName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{student.fullName}</h3>
                  <Badge className={(student.status === "attended" ? "bg-primary text-primary-foreground" : student.status === "absent" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground") + " rounded-full px-3 py-0.5"}>
                    {badgeText}
                  </Badge>
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="flex-1">{student.address}</span>
                  </div>
                  {attendedTime && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l2.5 2.5M12 22a10 10 0 100-20 10 10 0 000 20z" /></svg>
                        <span>{isPickup ? `${t.attendedAt} ${attendedTime}` : `${t.attendedAtDropoff} ${attendedTime}`}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 px-4 pt-4">
                  {student.status === "pending" && (
                    <Button onClick={() => handleAttend(student.id)} size="sm" disabled={isBusy || tripStatus === "completed"} className={`flex-1 rounded-xl ${isPickup ? "bg-primary" : "bg-accent text-accent-foreground"}`}>
                      {isPickup ? t.btnAttendedPickup : t.btnAttendedDropoff}
                    </Button>
                  )}
                  {student.status === "attended" && (
                    <Button onClick={() => handleUndoAttend(student.id)} size="sm" disabled={isBusy || tripStatus === "completed"} variant="outline" className="flex-1 border-border text-foreground rounded-xl">
                      {t.btnUndo}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

const renderWeeklyView = () => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4"></div>
        <p className="text-sm text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (weeklyGroups.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">{t.noTrips}</p>
      </div>
    );
  }

  const translateTripStatus = (status: string) => {
    const map: Record<string, string> = {
      scheduled: t.scheduled,
      in_progress: t.in_progress,
      completed: t.completed,
      cancelled: t.cancelled,
    };
    return map[status] || status;
  };

  const getStudentStatusText = (studentStatus: string, shiftType: 'pickup' | 'dropoff') => {
    if (studentStatus === 'attended') {
      return shiftType === 'pickup' ? t.btnAttendedPickup : t.btnAttendedDropoff;
    }
    if (studentStatus === 'absent') {
      return t.statusAbsent;
    }
    return shiftType === 'pickup' ? t.statusPendingPickup : t.statusPendingDropoff;
  };

  return (
    <div className="space-y-6 pb-6">
      {weeklyGroups.map((dayGroup) => {
        const dateObj = new Date(dayGroup.date);
        // Kiểm tra xem có phải hôm nay không
        const isToday = new Date().toDateString() === dateObj.toDateString();
        
        const dayName = dateObj.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
          weekday: 'long', day: 'numeric', month: 'long'
        });

        return (
          <div key={dayGroup.date} className="space-y-3">
            {/* Header ngày */}
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <h3 className={`font-semibold text-base capitalize ${isToday ? 'text-primary' : 'text-foreground'}`}>
                {dayName}
              </h3>
              {isToday && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {t.today}
                </span>
              )}
            </div>

            {/* Các chuyến trong ngày */}
            <div className="space-y-3">
              {dayGroup.shifts.map((shift) => {
                const isPickup = shift.type === 'pickup';
                const isMorning = shift.session === 'morning';
                
                // Màu nhấn cho nội dung bên trong (Sáng/Chiều)
                const accentColorClass = isMorning ? 'bg-orange-500' : 'bg-blue-500';
                const accentTextClass = isMorning ? 'text-orange-600' : 'text-blue-600';

                return (
                  <Card 
                    key={shift.tripId} 
                    // [MODIFIED] Logic class động để highlight chuyến hôm nay
                    className={`group overflow-hidden rounded-lg transition-all duration-300
                      ${isToday 
                        ? 'border-primary/60 ring-1 ring-primary/20 shadow-md bg-primary/[0.02]' // Style cho Hôm nay: Viền màu, bóng đổ, nền hơi tint
                        : 'border-border/60 shadow-sm hover:border-primary/50 bg-card' // Style ngày thường
                      }
                    `}
                  >
                    
                    {/* Header Chuyến */}
                    <div className="flex items-stretch">
                      {/* Thanh màu bên trái */}
                      <div/>
                      <div className={`w-1.5 flex-shrink-0 ${accentColorClass}`} />
                      <div className="flex-1 p-3 pl-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-foreground text-base leading-tight mb-1">
                              {shift.route}
                            </h4>
                            
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`font-medium ${accentTextClass}`}>
                                {isMorning ? t.sessionMorning : t.sessionAfternoon}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className={isPickup ? 'text-emerald-600' : 'text-purple-600'}>
                                {isPickup ? t.labelPickup : t.labelDropoff}
                              </span>
                            </div>
                          </div>

                          <Badge variant="secondary" className={`text-[10px] px-2 h-5 flex items-center gap-1 ${
                            shift.status === 'completed'   ? 'bg-emerald-100 text-emerald-700' :
                            shift.status === 'in_progress' ? 'bg-sky-100 text-sky-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                               shift.status === 'completed' ? 'bg-emerald-500' : 
                               shift.status === 'in_progress' ? 'bg-sky-500' : 'bg-gray-400'
                            }`} />
                            {translateTripStatus(shift.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Danh sách học sinh */}
                    <div className={`border-t ${isToday ? 'border-primary/10' : 'border-border/40'} bg-card/50`}>
                      {shift.students.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          {t.noStudent}
                        </div>
                      ) : (
                        <div className="divide-y divide-border/30">
                          {shift.students.map((st) => {
                            const isAttended = st.status === 'attended';
                            const isAbsent = st.status === 'absent';

                            return (
                              <div key={st.id} className="flex items-center justify-between py-2.5 px-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                    isAttended
                                      ? (isPickup ? 'bg-sky-500' : 'bg-emerald-500')
                                      : (isAbsent ? 'bg-red-400' : 'bg-gray-300')
                                  }`}>
                                    {st.fullName.charAt(0).toUpperCase()}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {st.fullName}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                      {st.address || '—'}
                                    </p>
                                  </div>
                                </div>

                                <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                                  isAttended && isPickup   ? 'bg-sky-100 text-sky-700' :
                                  isAttended && !isPickup  ? 'bg-emerald-100 text-emerald-700' :
                                  isAbsent                 ? 'bg-red-100 text-red-700' :
                                  isPickup ? 'bg-amber-50 text-amber-700' : 'bg-orange-50 text-orange-700'
                                }`}>
                                  {getStudentStatusText(st.status, shift.type)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Button>
              <h1 className="text-lg font-semibold text-foreground">{t.studentList}</h1>
            </div>
            {viewScope === 'daily' && (
                <div className="flex items-center gap-2">
                {tripStatus === "scheduled" && (
                    <Button size="sm" onClick={handleStartTrip} className="rounded-lg">
                    {tab === "morning" ? t.startShiftMorning : t.startShiftAfternoon}
                    </Button>
                )}
                {tripStatus !== "completed" && tripStatus !== "scheduled" && (
                    <Button size="sm" variant="outline" onClick={handleCompleteTrip} className="rounded-lg">
                    {tab === "morning" ? t.completeShiftMorning : t.completeShiftAfternoon}
                    </Button>
                )}
                </div>
            )}
          </div>
          {viewScope === 'daily' && (
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <Input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background border-border rounded-lg" />
              </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        
        {/* CHUYỂN ĐỔI NGÀY / TUẦN */}
{/* CHUYỂN ĐỔI NGÀY / TUẦN */}
<Card className="border-border/50 rounded-lg pt-7 transition-all duration-300">
  <CardContent className="p-1">
    <Tabs 
      value={viewScope} 
      onValueChange={(v) => setViewScope(v as "daily" | "weekly")} 
      className="w-full"
    >
      {/* 1. THANH CHUYỂN TAB (Đã sửa border + rounded-full) */}
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

      {/* Container chung để giữ chiều cao, tránh giật layout khi load */}
      <div className="min-h-[400px] transition-all"> 

        {/* === TAB NGÀY === */}
        {/* Thêm class animation fade-in */}
        <TabsContent value="daily" className="mt-0 focus-visible:outline-none animate-in fade-in-50 zoom-in-95 duration-300">
          
          {/* Tabs Sáng / Chiều */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 gap-2 bg-transparent border border-border/60 rounded-full">
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

          {/* Loading Skeleton hoặc Data */}
          <div className="space-y-4">
            {isLoading && viewScope === 'daily' ? (
              <StudentListSkeleton />
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Card className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                    <CardContent className="px-5 pt-5 p-3 text-center space-y-1">
                      <div className="text-xs font-medium text-slate-500">{t.total}</div>
                      <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    </CardContent>
                  </Card>
                  <Card className={`rounded-lg border shadow-sm bg-gradient-to-br ${isPickupShift ? "border-sky-200 from-sky-50 to-sky-100" : "border-emerald-200 from-emerald-50 to-emerald-100"}`}>
                    <CardContent className="px-5 pt-5 p-3 text-center space-y-1">
                      <div className={`text-xs font-medium ${isPickupShift ? "text-sky-600" : "text-emerald-600"}`}>{isPickupShift ? t.pickedUp : t.droppedOff}</div>
                      <div className={`text-2xl font-bold ${isPickupShift ? "text-sky-700" : "text-emerald-700"}`}>{isPickupShift ? stats.pickedUp : stats.droppedOff}</div>
                    </CardContent>
                  </Card>
                  <Card className={`rounded-lg border shadow-sm bg-gradient-to-br ${stats.remaining > 0 ? "border-amber-200 from-amber-50 to-amber-100" : "border-zinc-200 from-zinc-50 to-zinc-100"}`}>
                    <CardContent className="px-5 pt-5 p-3 text-center space-y-1">
                      <div className={`text-xs font-medium ${stats.remaining > 0 ? "text-amber-600" : "text-zinc-500"}`}>{t.remaining}</div>
                      <div className={`text-2xl font-bold ${stats.remaining > 0 ? "text-amber-700" : "text-zinc-700"}`}>{stats.remaining}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* List */}
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
                  {renderDailyList()}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* === TAB TUẦN === */}
        {/* Thêm class animation fade-in */}
        <TabsContent value="weekly" className="mt-0 focus-visible:outline-none animate-in fade-in-50 zoom-in-95 duration-300">
          <div className="space-y-4">
            <div className="text-center text-sm font-medium text-muted-foreground bg-accent/10 py-2 rounded-lg">
              {t.weekOf} {getWeekRange(new Date()).start.toLocaleDateString(language==='vi'?'vi-VN':'en-US')} - {getWeekRange(new Date()).end.toLocaleDateString(language==='vi'?'vi-VN':'en-US')}
            </div>
            
            {renderWeeklyView()}
          </div>
        </TabsContent>

      </div>
    </Tabs>
  </CardContent>
</Card>
      </main>

      <MobileNav />
    </div>
  );
}