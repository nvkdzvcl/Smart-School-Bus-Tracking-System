"use client";

import React from "react";
import {
  CalendarDays,
  Bus,
  User,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";
// Xóa hết import API và hooks (useUser, useEffect, useState...)

// --- INTERFACES (Nên move ra file types chung nếu được) ---
export interface TransformedTrip {
  id: string;
  tripId: string;
  dateDisplay: string;
  timeDisplay: string;
  title: string;
  route: { name: string };
  bus: { licensePlate: string };
  driver: { fullName: string };
  driverPhone: string;
  status: string;
  times: { actualStart: string | null; scheduledStart: string | null };
  statusConfig: { text: string; color: string };

  myChildren: {
    studentId: string;
    fullName: string;
    stop: { name: string; address: string };
    attendance: { status: string; attendedAt: string | null };
  }[];
}

type ParentScheduleProps = {
  schedule: any[]; // Nhận mảng data đã xử lý từ cha
};

export default function ParentSchedule({ schedule }: ParentScheduleProps) {
  // 1. Xử lý trường hợp trống
  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-white border border-slate-100 text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-slate-700">Không có lịch trình</p>
          <p className="text-sm text-slate-500">
            Chưa có chuyến đi nào trong tuần này.
          </p>
        </div>
      </div>
    );
  }

  // 2. Group dữ liệu theo ngày (để hiển thị header ngày)
  const groupedSchedule: Record<string, any[]> = {};
  schedule.forEach((item) => {
    if (!groupedSchedule[item.dateDisplay]) {
      groupedSchedule[item.dateDisplay] = [];
    }
    groupedSchedule[item.dateDisplay].push(item);
  });

  // 3. Render danh sách
  return (
    <section className="space-y-8 pb-4">
      {" "}
      {/* Tăng khoảng cách giữa các ngày (space-y-8) */}
      {Object.entries(groupedSchedule).map(([date, trips]) => (
        <div key={date} className="space-y-3 relative">
          {/* --- HEADER NGÀY (SỬA LẠI) --- */}
          <div className="sticky top-16 z-10 -mx-4 px-4 py-3 bg-slate-50/95 backdrop-blur border-y border-slate-200 shadow-sm flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              {/* Tách chuỗi "Thứ Năm, 20/11" ra để style riêng */}
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {date.split(",")[0]} {/* Thứ... */}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {date.split(",")[1]} {/* Ngày... */}
              </p>
            </div>
          </div>
          {/* ---------------------------- */}

          {/* Danh sách Card trong ngày */}
          <div className="space-y-4 px-1">
            {" "}
            {/* Thêm padding nhỏ */}
            {trips.map((trip) => (
              <TripCard key={trip.id + trip.studentName} trip={trip} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// --- CÁC COMPONENT CON & UTILS (Giữ nguyên logic hiển thị) ---

function TripCard({ trip }: { trip: any }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
      {/* Dải màu trạng thái bên trái */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${getTripStatusColor(
          trip.status
        )}`}
      ></div>

      {/* Header */}
      <div className="flex justify-between items-start pl-2">
        <div>
          {/* Tên con (nếu xem gộp nhiều bé) */}
          {trip.studentName && (
            <p className="text-xs font-bold text-blue-600 uppercase mb-1 tracking-wide">
              {trip.studentName}
            </p>
          )}
          <p className="font-bold text-slate-900 text-lg">{trip.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Tuyến: {trip.route.name}
          </p>
        </div>
        {/* Badge Status */}
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            getStatusBadge(trip.status).className
          }`}
        >
          {getStatusBadge(trip.status).label}
        </span>
      </div>

      {/* Info: Bus & Driver */}
      <div className="flex items-center gap-6 pl-2 pb-3 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Bus className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Xe số</p>
            <p className="text-sm font-semibold text-slate-700">
              {trip.bus.licensePlate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Tài xế</p>
            <p className="text-sm font-semibold text-slate-700">
              {trip.driver.fullName}
            </p>
          </div>
        </div>
      </div>

      {/* Time Info */}
      <div className="flex items-center gap-2 text-sm text-slate-600 pl-2">
        <Clock className="w-4 h-4 text-blue-500" />
        <span className="font-medium">Khởi hành: {trip.timeDisplay}</span>
      </div>

      {/* Children List */}
      <div className="space-y-2 pt-1 pl-2">
        {trip.myChildren.map((c: any, idx: number) => (
          <ChildRow key={idx} child={c} />
        ))}
      </div>
    </div>
  );
}

function ChildRow({ child }: { child: any }) {
  const badge = getAttendanceBadge(child.attendance.status);
  const initials = getAvatarLabel(child.fullName);

  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border shadow-sm shrink-0">
        <span className="text-slate-600 font-bold text-xs">{initials}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-bold text-slate-800 truncate">
            {child.fullName}
          </p>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className} shrink-0 ml-2`}
          >
            {badge.label}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{child.stop.name}</span>
        </div>

        {child.attendance.attendedAt && (
          <div className="mt-1 text-[10px] text-slate-500">
            {formatTime(child.attendance.attendedAt)}
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Utils Helpers (Giữ nguyên) --- */
function formatTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getAvatarLabel(name: string) {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

// Helper màu dải bên trái
function getTripStatusColor(status: string) {
  switch (status) {
    case "in_progress":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-slate-300";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "in_progress":
      return {
        label: "Đang chạy",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "scheduled":
      return {
        label: "Sắp tới",
        className: "bg-slate-50 text-slate-700 border-slate-200",
      };
    case "completed":
      return {
        label: "Hoàn thành",
        className: "bg-green-50 text-green-700 border-green-200",
      };
    case "cancelled":
      return {
        label: "Huỷ",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    default:
      return {
        label: status,
        className: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}

function getAttendanceBadge(status: string) {
  switch (status) {
    case "attended":
      return {
        label: "Đã điểm danh",
        className: "bg-green-50 text-green-700 border-green-200",
      };
    case "pending":
      return {
        label: "Đang chờ",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    case "absent":
      return {
        label: "Vắng mặt",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    default:
      return {
        label: status,
        className: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}
