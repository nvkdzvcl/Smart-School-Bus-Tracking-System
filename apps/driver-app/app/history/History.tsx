// apps/driver-app/src/history/History.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MobileNav } from "../../components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

// --- CẤU HÌNH API ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- INTERFACES (Đã cập nhật) ---
type TripHistory = {
  id: string;
  date: string;
  shift: string;
  route: string;
  startTime: string;
  endTime: string;
  totalStudents: number;
  pickedUp: number;
  droppedOff: number;
  distance: string;
  duration: string;
  incidents: number;
  status: "completed" | "incomplete";
  driverName: string; 
  driverPhone: string;
  driverEmail: string;
  licensePlate: string;
};

type Summary = {
  total_trips: number;
  total_completed: number;
  total_incidents: number;
};

interface ReportDetail {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  type: string;
}

export default function HistoryPage() {
  const navigate = useNavigate();

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [trips, setTrips] = useState<TripHistory[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return isNaN(date.getTime())
      ? d
      : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const authenticated = localStorage.getItem("driver_authenticated");

    if (!authenticated || !token) {
      navigate("/");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        const [historyRes, summaryRes] = await Promise.all([
          axios.get<TripHistory[]>(`${API_URL}/trips/history`, { headers }),
          axios.get<Summary>(`${API_URL}/trips/history/summary`, { headers }),
        ]);
        setTrips(historyRes.data || []);
        setSummary(summaryRes.data || null);
        setErr(null);
      } catch (e: any) {
        console.error(e);
        setErr(e?.response?.data?.message || "Không tải được lịch sử chuyến đi. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const totalTrips = summary?.total_trips ?? trips.length;
  const totalCompleted = summary?.total_completed ?? trips.filter(t => t.status === "completed").length;
  const totalIncidents = summary?.total_incidents ?? trips.reduce((a, t) => a + (t.incidents || 0), 0);

  const exportTripPdf = async (trip: TripHistory) => {
    setIsExporting(true);

    const [{ default: jsPDF }, htmlToImage] = await Promise.all([
      import("jspdf"),
      import("html-to-image"),
    ]);

    let reports: ReportDetail[] = [];
    let fetchError: string | null = null;
    if (trip.incidents > 0) {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get<ReportDetail[]>(
          `${API_URL}/reports/by-trip/${trip.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        reports = res.data || [];
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sự cố:", err);
        fetchError = "Không thể tải chi tiết sự cố.";
      }
    }

    const renderReportsHtml = (): string => {
      if (trip.incidents === 0) {
        return '<div style="margin-top:8px;font-size:14px;color:#374151;">Không có sự cố nào được ghi nhận.</div>';
      }
      if (fetchError) {
        return `<div style="margin-top:8px;font-size:14px;color:#DC2626;font-style:italic;">${fetchError}</div>`;
      }
      if (reports.length === 0) {
        return '<div style="margin-top:8px;font-size:14px;color:#6B7280;font-style:italic;">Đã ghi nhận sự cố nhưng không tìm thấy chi tiết.</div>';
      }

      return reports.map(r => `
        <div style="padding:12px;border:1px solid #E5E7EB;border-radius:8px;margin-top:10px;background:#F9FAFB;">
          <div style="font-size:15px;font-weight:600;color:#111827;">${r.title || 'Sự cố không có tiêu đề'}</div>
          <div style="font-size:14px;color:#374151;margin-top:4px;white-space:pre-wrap;word-wrap:break-word;">${r.content || 'Không có mô tả.'}</div>
          ${r.imageUrl ? `<div style="font-size:12px;color:#6B7280;margin-top:6px;font-style:italic;">(Có đính kèm hình ảnh)</div>` : ''}
        </div>
      `).join('');
    };

    const wrap = document.createElement("div");
    wrap.style.width = "800px";
    wrap.style.padding = "28px";
    wrap.style.boxSizing = "border-box";
    wrap.style.background = "#ffffff";
    wrap.style.color = "#111827";
    wrap.style.fontFamily = "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    wrap.style.border = "1px solid #E5E7EB";
    wrap.style.borderRadius = "12px";

    const ddmmyyyy = (s: string) => {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const statusBadge =
      trip.status === "completed"
        ? `<span style="display:inline-block;padding:6px 10px;border:1px solid #10B981;color:#059669;border-radius:999px;font-weight:600;font-size:12px;">Hoàn thành</span>`
        : `<span style="display:inline-block;padding:6px 10px;border:1px solid #EF4444;color:#DC2626;border-radius:999px;font-weight:600;font-size:12px;">Chưa hoàn thành</span>`;

    const shiftBadge =
      trip.shift === "Ca sáng"
        ? `<span style="display:inline-block;padding:6px 10px;background:#2563EB;color:#FFFFFF;border-radius:10px;font-weight:600;font-size:12px;">${trip.shift}</span>`
        : `<span style="display:inline-block;padding:6px 10px;background:#7C3AED;color:#FFFFFF;border-radius:10px;font-weight:600;font-size:12px;">${trip.shift}</span>`;

wrap.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
    <div>
      <div style="font-size:20px;font-weight:700;line-height:1.3;color:#111827;">BÁO CÁO CHUYẾN ĐI</div>
      <div style="margin-top:4px;font-size:12px;color:#6B7280;">Smart School Bus • Tài xế</div>
    </div>
    <div>${statusBadge}</div>
  </div>

  <div style="display:flex;align-items:center;gap:12px;margin:14px 0 22px;">
    ${shiftBadge}
    <div style="font-size:14px;color:#374151;font-weight:500;">${ddmmyyyy(trip.date)}</div>
  </div>

  <!-- Tuyến -->
  <div style="padding:14px 16px;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:16px;background:#F9FAFB;">
    <div style="font-size:13px;color:#6B7280;">Tuyến</div>
    <div style="font-size:17px;font-weight:600;color:#111827;margin-top:4px;">${trip.route || "N/A"}</div>
  </div>

  <!-- Tài xế & Xe -->
  <div style="padding:14px 16px;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:18px;background:#F9FAFB;">
    <div style="font-size:13px;color:#6B7280;margin-bottom:10px;">Thông tin Tài xế & Xe</div>

    <div style="font-size:14px;color:#111827;display:flex;flex-direction:column;gap:6px;">
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#6B7280;">Tên tài xế:</span>
        <span style="font-weight:600;">${trip.driverName || 'N/A'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#6B7280;">SĐT:</span>
        <span style="font-weight:600;">${trip.driverPhone || 'N/A'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#6B7280;">Email:</span>
        <span style="font-weight:600;">${trip.driverEmail || 'N/A'}</span>
      </div>

      <div style="margin-top:6px;padding-top:6px;border-top:1px dashed #D1D5DB;display:flex;justify-content:space-between;">
        <span style="color:#6B7280;">Biển số xe:</span>
        <span style="font-weight:600;">${trip.licensePlate || 'N/A'}</span>
      </div>
    </div>
  </div>

  <!-- Grid thông tin -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:10px;">
    <div style="padding:14px;border:1px solid #E5E7EB;border-radius:12px;background:white;">
      <div style="font-size:12px;color:#6B7280;">Thời gian</div>
      <div style="font-size:17px;font-weight:600;color:#111827;margin-top:2px;">${trip.startTime} — ${trip.endTime}</div>
    </div>
    <div style="padding:14px;border:1px solid #E5E7EB;border-radius:12px;background:white;">
      <div style="font-size:12px;color:#6B7280;">Thời lượng</div>
      <div style="font-size:17px;font-weight:600;color:#111827;margin-top:2px;">${trip.duration}</div>
    </div>
    <div style="padding:14px;border:1px solid #E5E7EB;border-radius:12px;background:white;">
      <div style="font-size:12px;color:#6B7280;">Học sinh</div>
      <div style="font-size:17px;font-weight:600;color:#111827;margin-top:2px;">${trip.pickedUp}/${trip.totalStudents} (đã đón/trả)</div>
    </div>
    <div style="padding:14px;border:1px solid #E5E7EB;border-radius:12px;background:white;">
      <div style="font-size:12px;color:#6B7280;">Quãng đường</div>
      <div style="font-size:17px;font-weight:600;color:#111827;margin-top:2px;">${trip.distance}</div>
    </div>
  </div>

  <!-- Sự cố -->
  <div style="margin-top:20px;padding-top:18px;border-top:1px dashed #E5E7EB;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <div style="width:8px;height:8px;background:#EF4444;border-radius:999px;"></div>
      <div style="font-size:17px;font-weight:700;color:#111827;">Chi tiết Sự cố & Báo cáo</div>
    </div>

    ${renderReportsHtml()}
  </div>

  <div style="margin-top:26px;font-size:11px;color:#9CA3AF;text-align:center;">
    Được tạo lúc ${new Date().toLocaleString("vi-VN")}
  </div>
`;



    const sandbox = document.createElement("div");
    sandbox.style.position = "fixed";
    sandbox.style.left = "-10000px";
    sandbox.style.top = "0";
    sandbox.appendChild(wrap);
    document.body.appendChild(sandbox);

    try {
      const dataUrl = await htmlToImage.toPng(wrap, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#FFFFFF"
      });

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => (img.onload = res));
      const ratio = img.height / img.width;

      let imgW = pageW - 48;
      let imgH = imgW * ratio;
      let x = 24, y = 24;

      if (imgH > pageH - 48) {
        imgH = pageH - 48;
        imgW = imgH / ratio;
        x = (pageW - imgW) / 2;
      }

      pdf.addImage(dataUrl, "PNG", x, y, imgW, imgH, undefined, "FAST");

      const safeDate = (trip.date?.slice(0, 10) || "").replaceAll("-", "");
      pdf.save(`Bao-cao-chuyen-di_${safeDate}_${trip.id.slice(0, 6)}.pdf`);
    } finally {
      document.body.removeChild(sandbox);
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Đang tải lịch sử chuyến đi...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-destructive">{err}</p>
        <div className="flex gap-2">
          <Button onClick={() => location.reload()} variant="outline">Thử lại</Button>
          <Button onClick={() => navigate("/dashboard")}>Về Bảng tin</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
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
              <h1 className="text-lg font-semibold text-foreground">Lịch sử chuyến đi</h1>
              <p className="text-xs text-muted-foreground">30 ngày gần đây</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Summary */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5 rounded-lg">
          <CardHeader><CardTitle className="text-base text-foreground">Tổng quan tháng này</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalTrips}</div>
                <div className="text-xs text-muted-foreground mt-1">Chuyến đi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{totalCompleted}</div>
                <div className="text-xs text-muted-foreground mt-1">Hoàn thành</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{totalIncidents}</div>
                <div className="text-xs text-muted-foreground mt-1">Sự cố</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip list */}
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="border-border/50 cursor-pointer hover:border-primary/50 transition-colors rounded-lg"
              onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
            >
              <CardContent
                className="p-4 pt-4"
                ref={(el) => (cardRefs.current[trip.id] = el)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{formatDate(trip.date)}</h3>
                      <Badge className={trip.status === "completed"
                        ? "bg-primary text-primary-foreground rounded-lg"
                        : "bg-destructive text-destructive-foreground rounded-lg"}>
                        {trip.shift}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{trip.route}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={(trip.status === "completed"
                      ? "border-accent text-accent"
                      : "border-destructive text-destructive") + " rounded-full px-2 py-0.5"}
                  >
                    {trip.status === "completed" ? "Hoàn thành" : "Chưa hoàn thành"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{trip.startTime} - {trip.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{trip.pickedUp}/{trip.totalStudents} học sinh</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span>{trip.distance}</span>
                  </div>
                </div>

                {trip.incidents > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{trip.incidents} sự cố được báo cáo</span>
                    </div>
                  </div>
                )}

                {selectedTrip?.id === trip.id && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Chi tiết chuyến đi</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Tổng học sinh:</span><span className="text-foreground font-medium">{trip.totalStudents}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Đã đón/trả:</span><span className="text-foreground font-medium">{trip.pickedUp}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Quãng đường:</span><span className="text-foreground font-medium">{trip.distance}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Thời gian:</span><span className="text-foreground font-medium">{trip.duration}</span></div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                      disabled={isExporting}
                      onClick={(e) => { e.stopPropagation(); exportTripPdf(trip); }}
                    >
                      {isExporting ? (
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {isExporting ? 'Đang xử lý...' : 'Xuất báo cáo'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {trips.length === 0 && (
            <Card className="border-dashed border-border/50">
              <CardContent className="p-6 text-center text-muted-foreground">
                Chưa có chuyến nào trong 30 ngày gần đây.
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
