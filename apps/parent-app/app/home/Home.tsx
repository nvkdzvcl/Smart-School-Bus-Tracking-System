"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Phone, Bus, Navigation, User } from "lucide-react";
import BottomNav from "../layout/components/BottomNav";
import { UserContext } from "@/context/UserContext";
import type { AttendanceStatus, Notification } from "@/types/data-types";
import { getNotificationsByUserId } from "@/lib/notificationApi";
import { getMyChildrenToday } from "@/lib/studentApi";
import Header from "../layout/components/Header";
import AlertBanner from "./components/AlertBanner";
import StudentCard from "./components/StudentCard";
import BusMap, { type MapStop, type BusLocation } from "@/components/BusMap";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function HomePage() {
  const { user } = useContext(UserContext)!;

  // --- STATE ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  
  // State Map
  const [mapStops, setMapStops] = useState<MapStop[]>([]);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);

  // --- LOGIC MAP DỮ LIỆU (QUAN TRỌNG: Lấy thông tin Tài xế & Xe) ---
  const transformStudentData = (apiData: any[]) => {
    const currentHour = new Date().getHours();
    const isMorningSession = currentHour < 12;

    return apiData.map((student) => {
      // Tìm chuyến đi khớp với buổi hiện tại (Sáng/Chiều)
      const currentTripStudent = student.tripStudents.find(
        (ts: any) => ts.trip?.session === (isMorningSession ? "morning" : "afternoon")
      );

      let status: AttendanceStatus = "absent";
      let statusText = "Không có lịch";
      let activeTripInfo = null;

      if (currentTripStudent) {
        status = currentTripStudent.status as AttendanceStatus;
        const trip = currentTripStudent.trip;
        const tripType = trip.type;


        // === 1. LẤY THÔNG TIN TÀI XẾ & XE TỪ API ===
        activeTripInfo = {
          id: trip.id,
          routeId: trip.route?.id, // ID tuyến để vẽ đường
          status: trip.status,     // scheduled | in_progress | completed
          session: trip.session,   // morning | afternoon
          
          // Thông tin Xe
          busPlate: trip.bus?.licensePlate || "Đang cập nhật",
          
          // Thông tin Tài xế
          driverName: trip.driver?.fullName || "Chưa phân công",
          driverPhone: trip.driver?.phone || "",
          
          // Ước tính (Có thể lấy từ Google API nếu muốn xịn hơn)
          eta: trip.status === 'in_progress' ? '5 phút nữa' : (trip.status === 'completed' ? 'Đã đến' : 'Đúng giờ'),
        };

        // Logic hiển thị trạng thái text (Giữ nguyên)
        if (status === "attended") {
          const time = new Date(currentTripStudent.attendedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          statusText = tripType === "pickup" ? `Đã lên xe lúc ${time}` : `Đã xuống xe lúc ${time}`;
        } else if (status === "pending") {
          const estimatedTime = trip.actualStartTime
            ? new Date(trip.actualStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "---";
          statusText = tripType === "pickup" ? `Đang chờ xe (Dự kiến ${estimatedTime})` : `Xe đang đến (Dự kiến ${estimatedTime})`;
        }
      }

      return {
        ...student,
        status,
        statusText,
        activeTrip: activeTripInfo, // Gắn activeTrip vào student
      };
    });
  };

  // ... (Các phần helper getAvatarLabel, handleDismissAlert giữ nguyên) ...
  const getAvatarLabel = (name: string | null | undefined) => {
    if (!name || name.trim() === "") return "U";
    return name.trim().split(/\s+/).pop()?.charAt(0).toUpperCase() || "U";
  };

  // --- FETCH DATA ---
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [notifRes, studentsRes] = await Promise.all([
          getNotificationsByUserId(user.id),
          getMyChildrenToday(user.id),
        ]);
        setNotifications(notifRes.data);
        const transformed = transformStudentData(studentsRes.data);
        setStudents(transformed);
        
        // Mặc định chọn bé đầu tiên
        if (transformed.length > 0 && !selectedStudentId) {
            setSelectedStudentId(transformed[0].id);
        }
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, [user]);

  // --- UPDATE MAP KHI ĐỔI HỌC SINH ---
  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId) || students[0], [students, selectedStudentId]);
  
  useEffect(() => {
    if (!selectedStudent?.activeTrip?.id) {
        setMapStops([]); setBusLocation(null); return;
    }
    // ... (Logic fetch Map Data giữ nguyên như bài trước) ...
    // Giả sử logic fetch API map ở đây
  }, [selectedStudent]);

  // Lấy Trip của bé đang chọn để hiển thị
  const currentTrip = selectedStudent?.activeTrip;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header title="Home" showNotifications notificationCount={2} />

      <main className="max-w-lg mx-auto px-4 space-y-6 mt-4">
        {/* ... Alert Banner ... */}

        {/* --- CARD THEO DÕI HÀNH TRÌNH (Bao gồm Map + Info Tài xế) --- */}
        <section>
          {currentTrip ? (
            <>
              {/* Header Card */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  {currentTrip.status === "in_progress" && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                  Hành trình hiện tại
                </h2>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-md capitalize">
                  {currentTrip.session === "morning" ? "Sáng" : "Chiều"} • {selectedStudent.fullName}
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* 1. MAP PREVIEW */}
                <div className="h-52 relative group bg-slate-100">
                  <BusMap stops={mapStops} busLocation={busLocation} className="w-full h-full" />
                  <Link to={`/tracking?studentId=${selectedStudent?.id}`} className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex gap-2">
                        <Navigation className="w-4 h-4" /> Xem chi tiết
                    </div>
                  </Link>
                </div>

                {/* 2. THÔNG TIN TÀI XẾ & XE (PHẦN BẠN CẦN) */}
                <div className="p-4">
                  {/* Dòng 1: Biển số & Trạng thái */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Biển số xe</p>
                      <p className="text-lg font-bold text-slate-800">{currentTrip.busPlate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Dự kiến đến</p>
                      <p className={`text-lg font-bold ${currentTrip.status === 'in_progress' ? 'text-green-600' : 'text-slate-600'}`}>
                        {currentTrip.eta}
                      </p>
                    </div>
                  </div>

                  {/* Dòng 2: Tài xế & Nút gọi */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar tài xế */}
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      
                      {/* Tên & Vai trò */}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{currentTrip.driverName}</p>
                        <p className="text-xs text-slate-500">Tài xế phụ trách</p>
                      </div>
                    </div>

                    {/* Nút Gọi Điện (Chỉ hiện nếu có số) */}
                    {currentTrip.driverPhone ? (
                        <a
                          href={`tel:${currentTrip.driverPhone}`}
                          className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition border border-green-200 shadow-sm"
                          title="Gọi tài xế"
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-not-allowed">
                            <Phone className="w-5 h-5" />
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Empty State
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Bus className="w-8 h-8" />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">Chưa có lịch trình</h3>
                <p className="text-slate-500 text-sm">Học sinh {selectedStudent?.fullName} hiện không có chuyến đi nào.</p>
            </div>
          )}
        </section>

        {/* --- DANH SÁCH HỌC SINH (Bộ chọn) --- */}
        <section>
          <h2 className="font-bold text-slate-800 mb-3">Học sinh</h2>
          <div className="space-y-3">
            {students.map((child) => (
              <StudentCard
                key={child.id}
                id={child.id}
                fullName={child.fullName}
                status={child.status}
                statusText={child.statusText}
                getAvatarLabel={getAvatarLabel}
                // Highlight bé đang chọn
                isSelected={child.id === selectedStudentId}
                // Click để đổi Map & Info tài xế ở trên
                onClick={() => setSelectedStudentId(child.id)}
              />
            ))}
          </div>
        </section>

        <BottomNav />
      </main>
    </div>
  );
}