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

interface StudentBE {
  id: string;
  fullName: string;
  address: string;
  status: "pending" | "attended" | "absent" | string;
}

interface StatsBE {
  total: number;
  pickedUp: number;
  droppedOff: number;
  remaining: number;
}

type TabKey = "morning" | "afternoon"; // UI
type ShiftKey = "pickup" | "dropoff";   // BE
type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | string;

export default function StudentsPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>("morning");
  const apiShift: ShiftKey = tab === "morning" ? "pickup" : "dropoff";

  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentBE[]>([]);
  const [stats, setStats] = useState<StatsBE>({ total: 0, pickedUp: 0, droppedOff: 0, remaining: 0 });
  const [tripStatus, setTripStatus] = useState<TripStatus>("scheduled");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const busyIds = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const fetchStudents = useCallback(async () => {
    const authenticated = localStorage.getItem("driver_authenticated");
    const token = localStorage.getItem("access_token");
    if (!authenticated || !token) {
      navigate("/");
      return;
    }

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

      // 2) Trạng thái trip để hiện nút
      const resDetails = await axios.get(`${API_URL}/schedule/active-trip-details`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { shift: apiShift },
        signal: abortRef.current.signal as any,
      });
      setTripStatus(resDetails.data.tripStatus ?? "scheduled");
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      console.error(`Lỗi khi tải ${apiShift}:`, err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigate("/");
          return;
        }
        if (err.response?.status === 404 && err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Không thể tải danh sách học sinh.");
        }
      } else {
        setError("Không thể tải danh sách học sinh.");
      }
      setStats({ total: 0, pickedUp: 0, droppedOff: 0, remaining: 0 });
      setStudents([]);
      setTripStatus("scheduled");
    } finally {
      setIsLoading(false);
    }
  }, [apiShift, navigate]);

  useEffect(() => {
    fetchStudents();
    return () => abortRef.current?.abort();
  }, [fetchStudents]);

  // Bắt đầu ca
  const handleStartTrip = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/");
    try {
      await axios.patch(
        `${API_URL}/schedule/start-trip`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } }
      );
      await fetchStudents();
    } catch (err: any) {
      console.error("Lỗi bắt đầu ca:", err);
      alert(err.response?.data?.message || "Không thể bắt đầu ca.");
    }
  };

  // Hoàn thành ca
  const handleCompleteTrip = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/");
    try {
      await axios.patch(
        `${API_URL}/schedule/complete-trip`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } }
      );
      await fetchStudents();
    } catch (err: any) {
      console.error("Lỗi hoàn thành ca:", err);
      alert(err.response?.data?.message || "Không thể hoàn thành ca.");
    }
  };

  // Điểm danh
  const handleAttend = async (studentId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/");
    if (busyIds.current.has(studentId)) return;

    const student = students.find((s) => s.id === studentId);
    if (!student || student.status === "attended") return;

    busyIds.current.add(studentId);
    try {
      await axios.patch(
        `${API_URL}/schedule/attend`,
        { studentId },
        { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } }
      );
      // Optimistic
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: "attended" } : s)));
      await fetchStudents();
    } catch (err: any) {
      console.error("Lỗi khi điểm danh:", err);
      alert(err.response?.data?.message || "Lỗi điểm danh, vui lòng thử lại.");
    } finally {
      busyIds.current.delete(studentId);
    }
  };

  // Hoàn tác
  const handleUndoAttend = async (studentId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/");
    if (busyIds.current.has(studentId)) return;

    busyIds.current.add(studentId);
    try {
      await axios.patch(
        `${API_URL}/schedule/undo-attend`,
        { studentId },
        { headers: { Authorization: `Bearer ${token}` }, params: { shift: apiShift } }
      );
      // Optimistic
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: "pending" } : s)));
      await fetchStudents();
    } catch (err: any) {
      console.error("Lỗi khi hoàn tác:", err);
      alert(err.response?.data?.message || "Lỗi hoàn tác, vui lòng thử lại.");
    } finally {
      busyIds.current.delete(studentId);
    }
  };

  const filteredStudents = useMemo(
    () => students.filter((s) => s.fullName.toLowerCase().includes(searchQuery.toLowerCase())),
    [students, searchQuery]
  );

  const renderLoading = () => (
    <Card className="border-border/50 rounded-lg">
      <CardContent className="p-8 text-center">
        <p className="text-muted-foreground">
          Đang tải dữ liệu ca {tab === "morning" ? "sáng" : "chiều"}...
        </p>
      </CardContent>
    </Card>
  );

  const renderError = () => (
    <Card className="border-border/50 rounded-lg">
      <CardContent className="p-8 text-center">
        <p className="text-destructive">{error || "Không có dữ liệu."}</p>
      </CardContent>
    </Card>
  );

  const renderStudentList = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (filteredStudents.length === 0) {
      return (
        <Card className="border-border/50 rounded-lg">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Không tìm thấy học sinh nào.</p>
          </CardContent>
        </Card>
      );
    }

    const isPickup = apiShift === "pickup";

    return filteredStudents.map((student) => {
      const isBusy = busyIds.current.has(student.id);
      return (
        <Card key={student.id} className="border-border/50 rounded-lg">
          <CardContent className="p-4 px-5 pt-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-secondary-foreground">{student.fullName.charAt(0)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{student.fullName}</h3>
                  </div>
                  <Badge
                    className={
                      (student.status === "attended"
                        ? "bg-primary text-primary-foreground"
                        : student.status === "absent"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground") + " rounded-full px-3 py-0.5"
                    }
                  >
                    {student.status === "attended"
                      ? isPickup
                        ? "Đã đón"
                        : "Đã trả"
                      : student.status === "absent"
                      ? "Vắng"
                      : isPickup
                      ? "Chưa đón"
                      : "Chưa trả"}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="flex-1">{student.address}</span>
                  </div>
                </div>

                <div className="flex gap-2 px-4 pt-4">
                  {student.status === "pending" && (
                    <Button
                      onClick={() => handleAttend(student.id)}
                      size="sm"
                      disabled={isBusy || tripStatus === "completed"}
                      className={`flex-1 rounded-lg ${
                        isPickup
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-accent hover:bg-accent/90 text-accent-foreground"
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isPickup ? "Đã đón" : "Đã trả"}
                    </Button>
                  )}

                  {student.status === "attended" && (
                    <Button
                      onClick={() => handleUndoAttend(student.id)}
                      size="sm"
                      disabled={isBusy || tripStatus === "completed"}
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Hoàn tác
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
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
                <h1 className="text-lg font-semibold text-foreground">Danh sách học sinh</h1>
                {/* Có thể thêm tên tuyến ở đây nếu cần */}
              </div>
            </div>

            {/* Nút điều khiển ca – áp dụng cho cả sáng & chiều */}
            <div className="flex items-center gap-2">
              {tripStatus === "scheduled" && (
                <Button size="sm" onClick={handleStartTrip} className="rounded-lg">
                  Bắt đầu ca {tab === "morning" ? "sáng" : "chiều"}
                </Button>
              )}
              {tripStatus !== "completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCompleteTrip}
                  className="rounded-lg"
                >
                  Hoàn thành ca {tab === "morning" ? "sáng" : "chiều"}
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border text-foreground rounded-lg"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-border/50 rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Tổng</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-primary">{stats.pickedUp}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Đã đón</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-accent">{stats.droppedOff}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Đã trả</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-muted-foreground">{stats.remaining}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Còn lại</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-lg">
            <TabsTrigger className="rounded-lg" value="morning">Ca sáng</TabsTrigger>
            <TabsTrigger className="rounded-lg" value="afternoon">Ca chiều</TabsTrigger>
          </TabsList>

          <TabsContent value="morning" className="space-y-3 mt-4">
            {renderStudentList()}
          </TabsContent>

          <TabsContent value="afternoon" className="space-y-3 mt-4">
            {renderStudentList()}
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
