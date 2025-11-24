"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  Bell,
  MapPin,
  Phone,
  Bus,
  Navigation,
  Clock,
  CalendarDays,
  MessageCircle,
  User,
  ChevronRight,
  AlertTriangle,
  CalendarClock,
  Info,
  X,
} from "lucide-react";
import BottomNav from "../layout/components/BottomNav";
import { UserContext } from "@/context/UserContext";
import type {
  AttendanceStatus,
  Notification,
  NotificationType,
  Student,
} from "@/types/data-types";
import { getNotificationsByUserId } from "@/lib/notificationApi";
import Header from "../layout/components/Header";
import AlertBanner from "./components/AlertBanner";
import { getMyChildrenToday } from "@/lib/studentApi";
import StudentCard from "./components/StudentCard";

// --- MOCK DATA (Dữ liệu giả lập) ---
const MOCK_DATA = {
  user: {
    name: "Nguyễn Văn Nam",
    avatar: "https://placehold.co/100x100/png?text=N",
    notificationCount: 2,
  },
  // Chuyến đi đang diễn ra (Active Trip)
  currentTrip: {
    id: "trip-001",
    status: "in_progress", // scheduled, in_progress, completed
    session: "Sáng",
    busPlate: "51B-123.45",
    driverName: "Trần Văn B",
    driverPhone: "0912345678",
    currentLocation: "Ngã tư Hàng Xanh, Bình Thạnh",
    eta: "5 phút nữa đến điểm đón",
    speed: "30 km/h",
  },
  // Danh sách học sinh và trạng thái hôm nay
  children: [
    {
      id: "child-1",
      name: "Nguyễn Văn An",
      school: "Tiểu học Nguyễn Bỉnh Khiêm",
      avatar: "https://placehold.co/100x100/png?text=A",
      status: "pending", // waiting, picked_up, dropped_off, absent
      statusText: "Đã lên xe lúc 06:45",
      pickupPoint: "Nhà thờ Đức Bà",
    },
    {
      id: "child-2",
      name: "Nguyễn Thị Bình",
      school: "Mầm non Hoa Mai",
      avatar: "https://placehold.co/100x100/png?text=B",
      status: "absent",
      statusText: "Đang chờ xe (Dự kiến 07:00)",
      pickupPoint: "Chợ Bến Thành",
    },
  ],
  // Thông báo mới nhất
  latestAlert: {
    type: "warning",
    message: "Kẹt xe tại đường D2, xe có thể đến trễ 5-10 phút.",
    time: "10 phút trước",
  },
};

export default function HomePage() {
  const { user } = useContext(UserContext)!;
  const { currentTrip, children, latestAlert } = MOCK_DATA;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);

  const [isStudentLoading, setIsStudentLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsNotificationLoading(true);
      setIsStudentLoading(true);
      try {
        const res = await getNotificationsByUserId(user.id);
        const students = await getMyChildrenToday(user.id);
        setNotifications(res.data);
        setStudents(transformStudentData(students.data));
      } catch (error) {
        console.error(error);
      } finally {
        setIsNotificationLoading(false);
        setIsStudentLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleDismissAlert = async (notificationId: string) => {
    // A. Cập nhật UI ngay lập tức (Optimistic Update)
    // Tìm thông báo đó trong list và set is_read = true
    const updatedList = notifications.map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    setNotifications(updatedList);
    console.log("first");

    // B. Gọi API ngầm bên dưới
    // try {
    //   await markNotificationAsRead(notificationId);
    // } catch (error) {
    //   console.error("Lỗi khi đánh dấu đã đọc:", error);
    //   // (Tùy chọn) Revert lại state nếu lỗi
    // }
  };

  const priorityAlert = notifications.find(
    (n) => n.type === "alert" || n.type === "reminder"
  );

  const getAvatarLabel = (name: string | null | undefined) => {
    // 1. Check: Nếu không có tên, trả về ký tự mặc định
    if (!name || name.trim() === "") return "U";

    // 2. Process: Xử lý chuỗi
    // - trim(): Xóa khoảng trắng đầu cuối
    // - split(/\s+/): Tách chuỗi dựa trên khoảng trắng (xử lý cả trường hợp nhiều dấu cách thừa)
    const parts = name.trim().split(/\s+/);

    // 3. Output: Lấy ký tự đầu của từ cuối cùng
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const transformStudentData = (apiData: any[]) => {
    const currentHour = new Date().getHours();
    const isMorningSession = currentHour < 12;

    return apiData.map((student) => {
      const currentTripStudent = student.tripStudents.find(
        (ts: any) =>
          ts.trip?.session === (isMorningSession ? "morning" : "afternoon")
      );

      let status: AttendanceStatus = "absent";
      let statusText = "Không có lịch";
      let tripType = "";

      if (currentTripStudent) {
        tripType = currentTripStudent.trip.type;

        status = currentTripStudent.status as AttendanceStatus;

        if (status === "attended") {
          const time = new Date(
            currentTripStudent.attendedAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          statusText =
            tripType === "pickup"
              ? `Đã lên xe lúc ${time}`
              : `Đã xuống xe lúc ${time}`;
        } else if (status === "pending") {
          const estimatedTime = currentTripStudent.trip?.actualStartTime
            ? new Date(
                currentTripStudent.trip?.actualStartTime
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "---";
          statusText =
            tripType === "pickup"
              ? `Đang chờ xe (Dự kiến ${estimatedTime})`
              : `Xe đang đến (Dự kiến ${estimatedTime})`;
        }
      }

      return {
        ...student,
        status,
        statusText,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header title="Home" showNotifications notificationCount={2} />

      <main className="max-w-lg mx-auto px-4 space-y-6 mt-4">
        {/* 2. ALERT BANNER (Nếu có thông báo gấp) */}
        {priorityAlert && (
          <AlertBanner alert={priorityAlert} onDismiss={handleDismissAlert} />
        )}

        {/* 3. LIVE TRACKING CARD (Phần quan trọng nhất) */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Hành trình hiện tại
            </h2>
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
              {currentTrip.session}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Giả lập Bản đồ */}
            <div className="h-40 bg-slate-200 relative flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover"></div>
              <div className="z-10 flex flex-col items-center gap-2">
                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  <Bus className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {currentTrip.currentLocation}
                  </span>
                </div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg group-hover:scale-105 transition-transform flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Xem bản đồ
                </div>
              </div>
            </div>

            {/* Thông tin chi tiết chuyến đi */}
            <div className="p-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Biển số xe</p>
                  <p className="text-lg font-bold text-slate-800">
                    {currentTrip.busPlate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Dự kiến đến</p>
                  <p className="text-lg font-bold text-green-600">
                    {currentTrip.eta}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {currentTrip.driverName}
                    </p>
                    <p className="text-xs text-slate-500">Tài xế</p>
                  </div>
                </div>
                <a
                  href={`tel:${currentTrip.driverPhone}`}
                  className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. STUDENT STATUS LIST */}
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
              />
            ))}
          </div>
        </section>
        <BottomNav />
      </main>
    </div>
  );
}