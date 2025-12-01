"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Bus, MapPin, Phone, User, ChevronDown, Map as MapIcon } from "lucide-react";
import BottomNav from "../layout/components/BottomNav";
import Header from "../layout/components/Header";

interface TripData {
  studentId: string;
  studentName: string;
  isBeingTracked: boolean;
  trip: {
    busPlate: string;
    driverName: string;
    driverPhone: string;
    status: string;
    eta: string;
    lat: number;
    lng: number;
    stopName: string;
    stopLat: number;
    stopLng: number;
    tripStatus: 'scheduled' | 'in_progress' | 'completed';
  };
}

const MOCK_DATA = {
  destinationStop: {
    name: "Điểm trả mặc định",
    address: "Quận 1, TP.HCM"
  },
  activeTrips: [
    {
      studentId: "student-an",
      studentName: "Nguyễn Văn An",
      isBeingTracked: true,
      trip: {
        busPlate: "51A-12345",
        driverName: "Trần Văn B (Tài xế)",
        driverPhone: "0912345678",
        status: "Đang trên đường đến điểm đón",
        eta: "5 phút",
        lat: 10.775000, lng: 106.695000,
        stopName: "Nhà Thờ Đức Bà",
        stopLat: 10.779780, stopLng: 106.699430,
        tripStatus: 'in_progress',
      }
    },
    {
      studentId: "student-binh",
      studentName: "Trần Thị Bình",
      isBeingTracked: false,
      trip: {
        busPlate: "51B-67890",
        driverName: "Lê Văn C",
        driverPhone: "0999999999",
        status: "Đã lên lịch (Chiều)",
        eta: "3 giờ",
        lat: 10.700000, lng: 106.600000,
        stopName: "Chợ Bến Thành",
        stopLat: 10.77250, stopLng: 106.69800,
        tripStatus: 'scheduled',
      }
    }
  ] as TripData[],
};

const useTrackingSimulation = (position: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
  const [currentPosition, setCurrentPosition] = useState(position);

  useEffect(() => {
    setCurrentPosition(position);

    if (position.lat === destination.lat && position.lng === destination.lng) return;

    const interval = setInterval(() => {
      setCurrentPosition((prev) => ({
        lat: prev.lat + (destination.lat - prev.lat) * 0.005,
        lng: prev.lng + (destination.lng - prev.lng) * 0.005,
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [position.lat, position.lng, destination.lat, destination.lng]);

  return currentPosition;
};

export default function TrackingPage() {
  const [trackingData] = useState(MOCK_DATA.activeTrips);
  const [selectedStudentId, setSelectedStudentId] = useState(MOCK_DATA.activeTrips[0].studentId);

  const currentTrackedTrip = useMemo(() => {
    return trackingData.find(t => t.studentId === selectedStudentId);
  }, [trackingData, selectedStudentId]);

  const simulatedPosition = useTrackingSimulation(
    { lat: currentTrackedTrip?.trip.lat ?? 0, lng: currentTrackedTrip?.trip.lng ?? 0 },
    { lat: currentTrackedTrip?.trip.stopLat ?? 0, lng: currentTrackedTrip?.trip.stopLng ?? 0 }
  );

  if (!currentTrackedTrip) {
    return <p className="p-4 text-center">Không có chuyến đi nào đang hoạt động.</p>;
  }

  const { trip: activeTrip, studentName } = currentTrackedTrip;

  const destinationInfo = {
    name: activeTrip.stopName,
    address: "Điểm dừng xe bus"
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+76px)]">
      <Header title={`Theo dõi bé ${studentName}`} showBack showNotifications />

      <main className="relative px-3">
        {/* INFO CARD (chứa map thu nhỏ) */}
        <div className="mt-3 bg-white shadow-2xl rounded-2xl p-3 sm:p-4 border-t-8 border-blue-500/10">
          {/* Map thu nhỏ */}
          <div className="bg-slate-100 rounded-xl border overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <MapIcon className="w-7 h-7 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  Bản đồ (mô phỏng)
                </p>
                <p className="text-xs text-slate-600 break-words">
                  Vị trí xe: {simulatedPosition.lat.toFixed(6)}, {simulatedPosition.lng.toFixed(6)}
                </p>
              </div>
            </div>
            {/* Khung preview map (thumbnail) */}
            <div className="h-28 sm:h-32 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
              <div className="flex items-center gap-2 text-blue-600">
                <MapIcon className="w-5 h-5" />
                <span className="text-xs font-medium">Map preview</span>
              </div>
            </div>
          </div>

          {/* Selector Học Sinh */}
          <div className="mt-4 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 p-1.5 rounded-full text-blue-600 shrink-0 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>

              <div className="flex-1 relative min-w-0">
                <select
                  className="w-full bg-transparent text-base sm:text-lg font-bold text-slate-800 appearance-none focus:outline-none cursor-pointer pr-6 truncate"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {trackingData.map(t => (
                    <option key={t.studentId} value={t.studentId}>
                      {t.studentName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="flex items-start sm:items-end justify-between gap-3 pb-2 sm:pb-3">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-slate-500 uppercase font-medium tracking-wide">
                DỰ KIẾN ĐẾN ĐIỂM DỪNG
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-green-600 mt-1">
                {activeTrip.eta}
              </h2>
            </div>
            <span
              className={`text-[11px] sm:text-xs font-medium px-2.5 py-1.5 rounded-full shrink-0
              ${activeTrip.tripStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
            >
              {activeTrip.status}
            </span>
          </div>

          {/* Chi tiết */}
          <div className="space-y-3 pt-2 sm:pt-3">
            {/* Biển số + Tài xế */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Bus className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-medium text-slate-900 truncate">
                    {activeTrip.busPlate}
                  </p>
                  <p className="text-xs text-slate-500">Biển số</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right min-w-0">
                  <p className="text-sm sm:text-base font-medium text-slate-900 truncate">
                    {activeTrip.driverName}
                  </p>
                  <p className="text-xs text-slate-500">Tài xế</p>
                </div>
                <a
                  href={`tel:${activeTrip.driverPhone}`}
                  className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition shrink-0"
                  aria-label="Gọi tài xế"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Điểm dừng */}
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border">
              <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-medium text-slate-900 truncate">
                  Điểm đón/trả: {destinationInfo.name}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 break-words">
                  {destinationInfo.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
