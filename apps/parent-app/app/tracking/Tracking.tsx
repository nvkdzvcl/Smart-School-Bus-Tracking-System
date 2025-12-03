"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { UserContext } from "@/context/UserContext";

// Import Component bản đồ dùng chung
import BusMap, { type MapStop, type BusLocation } from "@/components/BusMap";
import Header from "../layout/components/Header";
import BottomNav from "../layout/components/BottomNav";

// URL API
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// --- CẤU HÌNH TRẠNG THÁI TRIP (STATUS MAP) ---
const TRIP_STATUS_MAP: Record<
  string,
  { label: string; className: string; icon?: string }
> = {
  scheduled: {
    label: "Sắp chạy",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "🕒",
  },
  in_progress: {
    label: "Đang di chuyển",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse",
    icon: "●",
  },
  completed: {
    label: "Đã hoàn thành",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "🏁",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: "✕",
  },
};

// --- ICONS SVG ---
const ExpandIcon = () => (
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
    <polyline points="15 3 21 3 21 9"></polyline>
    <polyline points="9 21 3 21 3 15"></polyline>
    <line x1="21" y1="3" x2="14" y2="10"></line>
    <line x1="3" y1="21" x2="10" y2="14"></line>
  </svg>
);
const CompressIcon = () => (
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
    <polyline points="4 14 10 14 10 20"></polyline>
    <polyline points="20 10 14 10 14 4"></polyline>
    <line x1="14" y1="10" x2="21" y2="3"></line>
    <line x1="3" y1="21" x2="10" y2="14"></line>
  </svg>
);
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Tính heading đơn giản dựa theo 2 điểm liên tiếp
function calculateHeading(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) {
  const dLon = to.longitude - from.longitude;
  const dLat = to.latitude - from.latitude;
  const angleRad = Math.atan2(dLon, dLat);
  const angleDeg = (angleRad * 180) / Math.PI;
  return (angleDeg + 360) % 360;
}

const ParentTracking: React.FC = () => {
  const { user: profile } = useContext(UserContext)!;

  // --- STATE ---
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >(undefined);
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<MapStop[]>([]);
  const [busPosition, setBusPosition] = useState<BusLocation | null>(null);

  // Route chi tiết từ Goong (mảng [lng, lat])
  const [routeCoords, setRouteCoords] = useState<number[][]>([]);
  // Trạng thái đang demo hay không
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationTimerRef = useRef<number | null>(null);

  const students = useMemo(() => profile?.students ?? [], [profile]);

  const selectedStudent = useMemo(() => {
    if (!students || students.length === 0) return undefined;
    if (!selectedStudentId) return students[0];
    return students.find((s: any) => s.id === selectedStudentId) ?? students[0];
  }, [students, selectedStudentId]);

  // --- LOGIC FETCH DATA ---
  useEffect(() => {
    if (!selectedStudent?.id) return;

    // Reset state khi đổi học sinh
    setTrip(null);
    setStops([]);
    setBusPosition(null);
    setRouteCoords([]);
    setIsSimulating(false);
    if (simulationTimerRef.current !== null) {
      window.clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    let socket: Socket | null = null;

    const fetchData = async () => {
      try {
        const tripRes = await fetch(
          `${API_BASE}/users/students/${selectedStudent.id}/current-trip`
        );
        if (!tripRes.ok) return;

        const tripData = await tripRes.json();
        if (!tripData || Object.keys(tripData).length === 0) return;

        setTrip(tripData);

        const stopsRes = await fetch(
          `${API_BASE}/routes/${tripData.route_id}/stops`
        );
        const stopsData = await stopsRes.json();
        const mappedStops: MapStop[] = (stopsData || []).map((rs: any) => ({
          id: rs.stop_id,
          name: rs.stop.name,
          latitude: Number(rs.stop.latitude),
          longitude: Number(rs.stop.longitude),
          stop_order: rs.stop_order,
        }));
        setStops(mappedStops);

        const locRes = await fetch(
          `${API_BASE}/trips/${tripData.id}/locations?limit=1`
        );
        if (locRes.ok) {
          const locData = await locRes.json();
          if (locData && locData.length > 0) {
            const last = locData[0];
            setBusPosition({
              latitude: Number(last.latitude),
              longitude: Number(last.longitude),
              heading: 0,
            });
          }
        }

        socket = io(
          API_BASE.replace("/api", "") || "http://localhost:3000/tracking",
          { transports: ["websocket"], path: "/socket.io" }
        );
        socket.emit("joinTrip", { tripId: tripData.id });
        socket.on("locationUpdate", (loc: any) => {
          // Nếu đang demo thì bỏ qua socket update (cho khỏi giật)
          if (isSimulating) return;
          setBusPosition({
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude),
            heading: loc.heading || 0,
            speed: loc.speed || 0,
          });
        });
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();

    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent?.id]);

  // --- DEMO BUS CHẠY THEO ROUTE MỖI 3S ---
  useEffect(() => {
    if (!isSimulating || routeCoords.length === 0) {
      if (simulationTimerRef.current !== null) {
        window.clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      return;
    }

    let index = 0;

    // Set vị trí ban đầu
    const [lng0, lat0] = routeCoords[0];
    setBusPosition({
      latitude: lat0,
      longitude: lng0,
      heading: 0,
    });

    const id = window.setInterval(() => {
      index = (index + 1) % routeCoords.length;
      const [lng, lat] = routeCoords[index];

      setBusPosition((prev) => {
        const next = { latitude: lat, longitude: lng };
        const heading = prev ? calculateHeading(prev, next) : 0;
        return {
          ...next,
          heading,
          speed: prev?.speed,
        };
      });
    }, 500); // 3s / bước

    simulationTimerRef.current = id;

    return () => {
      if (simulationTimerRef.current !== null) {
        window.clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
    };
  }, [isSimulating, routeCoords]);

  if (!profile)
    return <div className="p-4 text-center text-gray-500">Đang tải...</div>;
  if (!students || students.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        Chưa có dữ liệu học sinh.
      </div>
    );

  const statusConfig = trip
    ? TRIP_STATUS_MAP[trip.status] || TRIP_STATUS_MAP.scheduled
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Theo Dõi" />

      <main className="max-w-2xl mx-auto min-h-screen relative">
        {/* --- PHẦN 1: CHỌN HỌC SINH --- */}
        <div className="px-4 pt-4">
          <h1 className="text-xl font-bold text-gray-800 mb-3">
            Theo dõi đưa đón
          </h1>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-gray-600">
                <UserIcon />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1 font-medium">
                  Học sinh
                </label>

                <div className="relative">
                  <select
                    className="w-full text-base font-bold text-gray-900 bg-transparent border-none p-0 pr-6 cursor-pointer focus:ring-0 focus:outline-none appearance-none truncate"
                    value={selectedStudent?.id}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin trạng thái chuyến đi */}
            {trip && statusConfig ? (
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold border flex items-center gap-1.5 ${statusConfig.className}`}
                >
                  {statusConfig.icon && <span>{statusConfig.icon}</span>}
                  {statusConfig.label}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {trip.route_name || "Tuyến chưa đặt tên"}
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Hiện không có chuyến đi nào đang hoạt động.
              </div>
            )}
          </div>
        </div>

        {/* --- NÚT DEMO CHẠY XE BUÝT --- */}
        {trip && routeCoords.length > 0 && (
          <div className="px-4 mt-3">
            <button
              className={`w-full py-2.5 rounded-xl text-sm font-semibold shadow-sm ${
                isSimulating
                  ? "bg-red-500 text-white"
                  : "bg-emerald-500 text-white"
              }`}
              onClick={() => {
                setIsSimulating((prev) => !prev);
              }}
            >
              {isSimulating ? "Dừng demo xe buýt" : "Bắt đầu demo xe buýt"}
            </button>
          </div>
        )}

        {/* --- PHẦN 2: BẢN ĐỒ --- */}
        <div className="mx-4 mt-4 h-[350px] rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-gray-100 relative">
          <BusMap
            stops={stops}
            busLocation={busPosition}
            className="w-full h-full"
            onRouteLoaded={(coords) => {
              setRouteCoords(coords || []);
            }}
          />
        </div>

        {/* --- PHẦN 3: CHI TIẾT --- */}
        {trip && (
          <div className="px-4 mt-5">
            <h3 className="text-base font-bold text-gray-800 mb-3 px-1">
              Chi tiết hành trình
            </h3>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="relative pl-2">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                {stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="mb-6 relative last:mb-0 pl-6"
                  >
                    <div
                      className={`
                      absolute left-0 top-1 w-4 h-4 rounded-full border-[3px] border-white shadow-sm box-content
                      ${
                        index === 0
                          ? "bg-emerald-500 ring-1 ring-emerald-200"
                          : index === stops.length - 1
                          ? "bg-red-500 ring-1 ring-red-200"
                          : "bg-blue-500 ring-1 ring-blue-200"
                      }
                    `}
                    ></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800 leading-none mb-1">
                        {stop.name}
                      </span>
                      {index === 0 && (
                        <span className="text-xs font-medium text-emerald-600">
                          Điểm đón
                        </span>
                      )}
                      {index === stops.length - 1 && (
                        <span className="text-xs font-medium text-red-600">
                          Điểm trả
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-center text-gray-400 font-medium">
              Cập nhật lần cuối:{" "}
              {new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default ParentTracking;
