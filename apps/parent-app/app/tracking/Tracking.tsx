// apps/parent-app/app/tracking/Tracking.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import ReactMapGL, {
  Marker,
  Source,
  Layer,
} from "@goongmaps/goong-map-react";
import { io, Socket } from "socket.io-client";
import { UserContext } from "@/context/UserContext";

type Stop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
};

type Location = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

type MapViewport = {
  latitude: number;
  longitude: number;
  zoom: number;
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100vh",
};

const ParentTracking: React.FC = () => {
  const { user: profile } = useContext(UserContext)!;

  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >(undefined);
  console.log("profile: ", profile)

  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [busPosition, setBusPosition] = useState<Location | null>(null);
  const [busTrail, setBusTrail] = useState<Location[]>([]);

  const [viewport, setViewport] = useState<MapViewport>({
    latitude: 10.77653,
    longitude: 106.70098,
    zoom: 14,
  });
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


  // Danh sách con của phụ huynh
  const students = useMemo(() => profile?.students ?? [], [profile]);

  // Chọn học sinh: nếu chưa chọn thì ưu tiên đứa đầu tiên
  const selectedStudent = useMemo(() => {
    if (!students || students.length === 0) return undefined;

    if (!selectedStudentId) {
      return students[0];
    }

    return students.find((s: any) => s.id === selectedStudentId) ?? students[0];
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (!selectedStudent?.id) return;

    let socket: Socket | null = null;

    const fetchData = async () => {
      try {
        // 1. Trip hiện tại của học sinh
        const tripRes = await fetch(
          `${API_BASE}/users/students/${selectedStudent.id}/current-trip`
        );
        if (!tripRes.ok) {
          console.error("Failed to fetch current trip");
          setTrip(null);
          setStops([]);
          setBusPosition(null);
          setBusTrail([]);
          return;
        }


        const tripData = await tripRes.json();
        console.log("tripRes: ", tripData)

        if (!tripData) {
          setTrip(null);
          setStops([]);
          setBusPosition(null);
          setBusTrail([]);
          return;
        }

        setTrip(tripData);


        // 2. Route stops
        const stopsRes = await fetch(`${API_BASE}/routes/${tripData.route_id}/stops`);
        const stopsData = await stopsRes.json();

        const mappedStops: Stop[] = (stopsData || []).map((rs: any) => ({
          id: rs.stop_id,
          name: rs.stop.name,
          latitude: Number(rs.stop.latitude),
          longitude: Number(rs.stop.longitude),
          stop_order: rs.stop_order,
        }));
        setStops(mappedStops);

        // 3. Các location gần nhất (lấy 50 điểm để vẽ hành trình)
        const locRes = await fetch(
          `${API_BASE}/trips/${tripData.id}/locations?limit=50`
        );
        if (locRes.ok) {
          const locData = await locRes.json();
          const mappedLocs: Location[] = (locData || []).map((l: any) => ({
            latitude: Number(l.latitude),
            longitude: Number(l.longitude),
            timestamp: l.timestamp,
          }));

          if (mappedLocs.length > 0) {
            // locData sort DESC (mới nhất trước) → đảo lại để vẽ từ cũ -> mới
            const trail = [...mappedLocs].reverse();
            setBusTrail(trail);

            const last = mappedLocs[0];
            setBusPosition(last);

            setViewport((vp: MapViewport) => ({
              ...vp,
              latitude: last.latitude,
              longitude: last.longitude,
            }));
          } else if (mappedStops.length > 0) {
            // Không có location -> center vào stop đầu
            setBusTrail([]);
            setViewport((vp: MapViewport) => ({
              ...vp,
              latitude: mappedStops[0].latitude,
              longitude: mappedStops[0].longitude,
            }));
          }
        }

        // 4. Socket realtime
        socket = io("http://localhost:3000/tracking", {
          transports: ["websocket"],
        });

        socket.emit("joinTrip", { tripId: tripData.id });

        socket.on("locationUpdate", (loc: any) => {
          const newPos: Location = {
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude),
            timestamp: loc.timestamp,
          };
          setBusPosition(newPos);
          setBusTrail((prev) => [...prev, newPos]);

          setViewport((vp: MapViewport) => ({
            ...vp,
            latitude: newPos.latitude,
            longitude: newPos.longitude,
          }));
        });
      } catch (err) {
        console.error("Error loading tracking data:", err);
      }
    };

    fetchData();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [selectedStudent?.id]);

  // GeoJSON cho polyline tuyến (theo stops)
  const routeGeoJson = useMemo(() => {
    if (stops.length < 2) return null;

    return {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: stops.map((s) => [s.longitude, s.latitude]),
      },
      properties: {},
    };
  }, [stops]);

  // GeoJSON cho hành trình xe (theo Bus_Locations)
  const busTrailGeoJson = useMemo(() => {
    if (busTrail.length < 2) return null;

    return {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: busTrail.map((p) => [p.longitude, p.latitude]),
      },
      properties: {},
    };
  }, [busTrail]);

  const goongToken = import.meta.env.VITE_GOONG_MAPTILES_KEY as string;

  if (!goongToken) {
    return <div>Chưa cấu hình VITE_GOONG_MAPTILES_KEY</div>;
  }

  if (!profile) {
    return <div>Đang tải thông tin phụ huynh...</div>;
  }

  if (!students || students.length === 0) {
    return <div>Phụ huynh hiện chưa có học sinh nào được gán.</div>;
  }
        console.log("trip: ", trip)

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Chọn học sinh (nếu có nhiều con) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          background: "white",
          padding: 8,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <b>Phụ huynh:</b>{" "}
          {profile.fullName || profile.fullName || profile.phone || profile.id}
        </div>
        <label>
          <b>Chọn học sinh:&nbsp;</b>
          <select
            value={selectedStudent?.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.full_name || s.fullName || s.name || s.id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ReactMapGL
        {...viewport}
        width={containerStyle.width as string}
        height={containerStyle.height as string}
        mapStyle="https://tiles.goong.io/assets/goong_map_web.json"
        goongApiAccessToken={goongToken}
        onViewportChange={(vp: any) =>
          setViewport({
            latitude: vp.latitude,
            longitude: vp.longitude,
            zoom: vp.zoom,
          } as MapViewport)
        }
      >
        {/* Polyline tuyến chuẩn (Stops) */}
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": "#007bff",
                "line-width": 4,
              }}
            />
          </Source>
        )}

        {/* Polyline hành trình xe (Bus_Locations) */}
        {busTrailGeoJson && (
          <Source id="bus-trail" type="geojson" data={busTrailGeoJson}>
            <Layer
              id="bus-trail-line"
              type="line"
              paint={{
                "line-color": "#ff8800",
                "line-width": 3,
              }}
            />
          </Source>
        )}

        {/* Marker các điểm dừng */}
        {stops.map((s) => (
          <Marker key={s.id} longitude={s.longitude} latitude={s.latitude}>
            <div
              style={{
                background: "#fff",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #007bff",
                fontSize: 12,
                fontWeight: 600,
              }}
              title={s.name}
            >
              {s.stop_order}
            </div>
          </Marker>
        ))}

        {/* Marker xe buýt */}
        {busPosition && (
          <Marker
            longitude={busPosition.longitude}
            latitude={busPosition.latitude}
          >
            <img
              src="/bus-icon.png"
              alt="Bus"
              style={{ width: 40, height: 40 }}
            />
          </Marker>
        )}
      </ReactMapGL>

      {/* Overlay info */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          padding: 12,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div>
          <b>Học sinh:</b>{" "}
          {selectedStudent?.fullName ||
            selectedStudent?.id}
        </div>
        <div>
          <b>Tuyến:</b> {trip?.route_name || trip?.route_id || "Không có"}
        </div>
        <div>
          <b>Trạng thái chuyến:</b> {trip?.status || "N/A"}
        </div>
        {busPosition && (
          <div>
            <b>Vị trí cập nhật lúc:</b>{" "}
            {new Date(busPosition.timestamp).toLocaleTimeString()}
          </div>
        )}
        {!trip && (
          <div>Hôm nay chưa có chuyến nào cho học sinh này.</div>
        )}
      </div>
    </div>
  );
};

export default ParentTracking;
