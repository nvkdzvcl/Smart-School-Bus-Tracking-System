"use client";

import React, { useState, useEffect, useContext } from "react";
import Header from "../layout/components/Header";
import BottomNav from "../layout/components/BottomNav";
import ParentSchedule from "./components/ParentSchedule";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { vi } from "date-fns/locale";

// Import API
import { getSchedule } from "@/lib/tripApi"; // API lấy lịch 1 bé
import { UserContext } from "@/context/UserContext";

// --- HÀM TRANSFORM DỮ LIỆU (Đã tách nhỏ để tái sử dụng) ---
const transformTripStudent = (tripStudent: any, studentName: string) => {
  const { trip, status } = tripStudent;
  const { driver, bus, route } = trip;

  // 1. Format ngày tháng
  const dateDisplay = format(new Date(trip.tripDate), "EEEE, dd/MM", {
    locale: vi,
  });

  // 2. Format giờ
  const timeDisplay = format(
    new Date(trip.actualStartTime || trip.createdAt),
    "HH:mm"
  );

  // 3. Loại chuyến
  const typeDisplay = trip.type === "pickup" ? "Đón" : "Trả";
  const sessionDisplay = trip.session === "morning" ? "Sáng" : "Chiều";

  // 4. Config màu sắc badge
  let statusConfig = { text: "", color: "" };
  switch (status) {
    case "attended":
      statusConfig = { text: "Đã xong", color: "text-green-600 bg-green-50" };
      break;
    case "pending":
      statusConfig = { text: "Sắp tới", color: "text-yellow-600 bg-yellow-50" };
      break;
    case "absent":
      statusConfig = { text: "Vắng", color: "text-red-600 bg-red-50" };
      break;
    default:
      statusConfig = { text: "N/A", color: "text-gray-500" };
  }

  return {
    id: tripStudent.tripId || trip.id, // Lưu ý key id
    tripId: trip.id,
    dateDisplay,
    timeDisplay,
    title: `${typeDisplay} ${sessionDisplay}`,
    route: { name: route?.name || "Chưa cập nhật" },
    bus: { licensePlate: bus?.licensePlate || "---" },
    driver: { fullName: driver?.fullName || "---" },
    driverPhone: driver?.phone,
    status: trip.status, 
    times: {
      actualStart: trip.actualStartTime,
      scheduledStart: null,
    },
    statusConfig,
    studentName: studentName, // Gán tên học sinh vào đây
    
    // Giữ cấu trúc cho ParentSchedule (nếu component con cần)
    myChildren: [
      {
        studentId: tripStudent.studentId,
        fullName: studentName,
        stop: { 
           name: trip.type === 'pickup' ? "Điểm đón" : "Điểm trả", 
           address: "..." 
        },
        attendance: { status: status, attendedAt: tripStudent.attendedAt }
      }
    ]
  };
};

export default function SchedulePage() {
  const { user } = useContext(UserContext)!;
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State ngày tháng
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State danh sách học sinh & lựa chọn
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

  // Tính toán tuần
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekLabel = `${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM')}`;

  // Hàm chuyển tuần
  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // 1. Lấy danh sách học sinh (Chạy 1 lần khi load trang)
  useEffect(() => {
    if (!user) return;
    setStudentsList(user.students);
  }, [user]);

  // 2. Lấy lịch trình (Chạy khi User, Tuần, hoặc SelectedStudent thay đổi)
  useEffect(() => {
    // Chỉ chạy khi đã có user và danh sách học sinh đã được tải xong
    if (!user || studentsList.length === 0) return;

    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const fromStr = format(startDate, "yyyy-MM-dd");
        const toStr = format(endDate, "yyyy-MM-dd");
        let rawResults: any[] = [];

        if (selectedStudentId !== "all") {
          // === TRƯỜNG HỢP 1: Chọn 1 Bé ===
          // Tìm tên bé để hiển thị
          const student = studentsList.find(s => s.id === selectedStudentId);
          const studentName = student?.fullName || "";
          
          // Gọi API lấy lịch của 1 bé
          const res = await getSchedule(selectedStudentId, fromStr, toStr);
          
          // Transform dữ liệu
          rawResults = res.data.map((item: any) => transformTripStudent(item, studentName));


        } else {
          // === TRƯỜNG HỢP 2: Chọn "Tất cả" ===
          // Lặp qua danh sách con, gọi API cho TỪNG bé
          const promises = studentsList.map(async (student) => {
            const res = await getSchedule(student.id, fromStr, toStr);
            // Transform ngay lập tức với tên của bé đó
            return res.data.map((item: any) => transformTripStudent(item, student.fullName));
          });

          // Đợi tất cả API trả về
          const results = await Promise.all(promises);
          
          // Gộp (Flatten) mảng lồng nhau thành 1 mảng duy nhất
          rawResults = results.flat();
        }

        // Sắp xếp theo thời gian (Ngày -> Giờ) để hiển thị đúng thứ tự
        rawResults.sort((a: any, b: any) => {
           const timeA = new Date(a.times.actualStart || `2000-01-01 ${a.timeDisplay}`).getTime();
           const timeB = new Date(b.times.actualStart || `2000-01-01 ${b.timeDisplay}`).getTime();
           return timeA - timeB;
        });

        setScheduleData(rawResults);

      } catch (error) {
        console.error("Lỗi tải lịch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [user, currentDate, selectedStudentId, studentsList]); 
  // Dependency: Khi đổi tuần hoặc đổi học sinh -> useEffect chạy lại

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Lịch trình" showBack={false} showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* --- KHUNG ĐIỀU KHIỂN (Sticky Top) --- */}
        <div className="bg-white p-3 rounded-xl shadow-sm space-y-3 sticky top-0 z-10">
           
           {/* 1. Dropdown Chọn Học Sinh */}
           <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                 <Filter className="w-4 h-4" />
              </div>
              <select 
                className="flex-1 bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                 <option value="all">Tất cả các con</option>
                 {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>{st.fullName}</option>
                 ))}
              </select>
           </div>

           {/* 2. Điều hướng Tuần */}
           <div className="flex items-center justify-between">
                <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-800 text-lg">{weekLabel}</span>
                    <button onClick={handleToday} className="text-xs text-blue-600 font-medium hover:underline">
                        Hôm nay
                    </button>
                </div>

                <button onClick={handleNextWeek} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <ChevronRight className="w-5 h-5" />
                </button>
           </div>
        </div>

        {/* --- NỘI DUNG LỊCH --- */}
        {isLoading ? (
           <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-white rounded-xl"></div>
              <div className="h-32 bg-white rounded-xl"></div>
           </div>
        ) : (
           // Truyền data đã xử lý xuống component hiển thị
           <ParentSchedule schedule={scheduleData} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}