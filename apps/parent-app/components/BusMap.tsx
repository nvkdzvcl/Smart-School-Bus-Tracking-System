"use client";

import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import polyline from "@mapbox/polyline";

// --- Types ---
export interface MapStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
}

export interface BusLocation {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

interface BusMapProps {
  stops: MapStop[];
  busLocation?: BusLocation | null;
  className?: string;
  showTraffic?: boolean;
}

// 1. Icon Xe Buýt (Base64)
const BUS_ICON_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTQ4OCAxMjhoLThWODBjMC0yNi41LTIxLjUtNDgtNDgtNDhIODBjLTI2LjUgMC00OCAyMS41LTQ4IDQ4djQ4SDI0Yy0xMy4zIDAtMjQgMTAuNy0yNCAyNHY0OGMwIDEzLjMgMTAuNyAyNCAyNCAyNHYxNjBjMCAxNy43IDE0LjMgMzIgMzIgMzJoMzJjMTcuNyAwIDMyLTE0LjMgMzItMzJ2LTMyaDI3MnYzMmMwIDE3LjcgMTQuMyAzMiAzMiAzMmgzMmMxNy43IDAgMzItMTQuMyAzMi0zMlYyMjRjMTMuMyAwIDI0LTEwLjcgMjQtMjR2LTQ4YzAtMTMuMy0xMC43LTI0LTI0LTI0ek0xMjggNDAwYy0xNy43IDAtMzItMTQuMy0zMi0zMnMxNC4zLTMyIDMyLTMyIDMyIDE0LjMgMzIgMzItMTQuMyAzMi0zMiAzMnptMjU2IDBjLTE3LjcgMC0zMi0xNC4zLTMyLTMyczE0LjMtMzIgMzItMzIgMzIgMTQuMyAzMiAzMi0xNC4zIDMyLTMyIDMyek04MCA4MGgzNTJ2MTI4SDgwVjAweiIvPjwvc3ZnPg==";

// 2. Icon Mũi Tên (Chevron) - Đậm và rõ nét hơn
// Hình chữ V ngang (>), màu trắng, có viền nhẹ để nổi trên mọi nền
const ARROW_ICON_BASE64 = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z' fill='white' stroke='rgba(0,0,0,0.1)' stroke-width='1'/%3E%3C/svg%3E";

const BusMap: React.FC<BusMapProps> = ({
  stops,
  busLocation,
  className = "w-full h-[500px] rounded-lg shadow-md",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const busMarkerRef = useRef<any>(null);
  const stopMarkersRef = useRef<any[]>([]);

  // 1. Khởi tạo bản đồ & Load ảnh mũi tên
  useEffect(() => {
    const mapTilesKey = import.meta.env?.VITE_GOONG_MAPTILES_KEY || process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;
    if (!mapTilesKey) return;

    goongjs.accessToken = mapTilesKey;

    const defaultCenter = [106.660172, 10.762622];

    const initializedMap = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: defaultCenter,
      zoom: 13,
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
    });

    initializedMap.addControl(new goongjs.NavigationControl(), "top-right");

    initializedMap.on("load", () => {
      // --- QUAN TRỌNG: Load ảnh mũi tên vào Map ---
      // Dùng tên "arrow-icon" để tham chiếu sau này
      const img = new Image(24, 24);
      img.onload = () => {
          if (!initializedMap.hasImage("arrow-icon")) {
              initializedMap.addImage("arrow-icon", img);
          }
      };
      img.src = ARROW_ICON_BASE64;

      setMap(initializedMap);
    });

    return () => initializedMap.remove();
  }, []);

  // 2. VẼ MARKER STOP
  useEffect(() => {
    if (!map) return;
    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current = [];

    if (!stops || stops.length === 0) return;

    const sortedStops = [...stops].sort((a, b) => a.stop_order - b.stop_order);

    sortedStops.forEach((stop) => {
      const isStart = stop.stop_order === 1;
      const isEnd = stop.stop_order === sortedStops.length;
      const bgColor = isStart ? "#10b981" : isEnd ? "#ef4444" : "#3b82f6";

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "36px", height: "36px", backgroundColor: bgColor, borderRadius: "50%",
        border: "3px solid white", boxShadow: "0 3px 5px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
         cursor: "pointer"
      });

      const iconImg = document.createElement("img");
      iconImg.src = BUS_ICON_BASE64;
      Object.assign(iconImg.style, { width: "18px", height: "18px", display: "block", pointerEvents: "none" });
      el.appendChild(iconImg);

      const badge = document.createElement("div");
      badge.innerText = stop.stop_order.toString();
      Object.assign(badge.style, {
        position: "absolute", top: "-5px", right: "-5px", backgroundColor: "white",
        color: bgColor, fontWeight: "bold", fontSize: "11px", width: "18px", height: "18px",
        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${bgColor}`, boxShadow: "0 2px 2px rgba(0,0,0,0.2)", zIndex: "10"
      });
      el.appendChild(badge);

      const popup = new goongjs.Popup({ offset: 25, closeButton: false }).setText(stop.name);
      el.addEventListener('mouseenter', () => popup.addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());

      const marker = new goongjs.Marker({ element: el, anchor: 'center' })
        .setLngLat([stop.longitude, stop.latitude])
        .setPopup(popup)
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });
  }, [map, stops]);

  // 3. VẼ ROUTE + MŨI TÊN CHỈ HƯỚNG
  useEffect(() => {
    if (!map) return;

    const sourceId = "bus-route";
    const layerIdLine = "bus-route-line";
    const layerIdArrow = "bus-route-arrow";

    // Xóa cũ
    if (!stops || stops.length < 2) {
        if (map.getLayer(layerIdArrow)) map.removeLayer(layerIdArrow);
        if (map.getLayer(layerIdLine)) map.removeLayer(layerIdLine);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        return;
    }

    const drawRoute = async () => {
      const sortedStops = [...stops].sort((a, b) => a.stop_order - b.stop_order);
      const apiKey = import.meta.env?.VITE_GOONG_API_KEY || process.env.NEXT_PUBLIC_GOONG_API_KEY;

      const segments = [];
      for (let i = 0; i < sortedStops.length - 1; i++) {
        segments.push({ start: sortedStops[i], end: sortedStops[i + 1] });
      }

      try {
        const requests = segments.map((segment) => {
          const originStr = `${segment.start.latitude},${segment.start.longitude}`;
          const destStr = `${segment.end.latitude},${segment.end.longitude}`;
          const url = `https://rsapi.goong.io/Direction?origin=${originStr}&destination=${destStr}&vehicle=car&api_key=${apiKey}`;
          return fetch(url).then((res) => res.json());
        });

        const responses = await Promise.all(requests);
        let fullRouteCoordinates: number[][] = [];

        responses.forEach((data) => {
          if (data.routes && data.routes.length > 0) {
            const coords = polyline.decode(data.routes[0].overview_polyline.points)
              .map((pair: number[]) => [pair[1], pair[0]]);
            fullRouteCoordinates = fullRouteCoordinates.concat(coords);
          }
        });

        if (fullRouteCoordinates.length > 0) {
          if (map.getSource(sourceId)) {
            map.getSource(sourceId).setData({
              type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: fullRouteCoordinates },
            });
          } else {
            map.addSource(sourceId, {
              type: "geojson",
              data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: fullRouteCoordinates } },
            });
            
            // Layer 1: Đường màu xanh lá
            map.addLayer({
              id: layerIdLine,
              type: "line",
              source: sourceId,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#10b981", // Xanh lá
                "line-width": 6,
              },
            });

            // Layer 2: Mũi tên chỉ hướng (CẤU HÌNH ĐỂ LUÔN HIỆN)
            map.addLayer({
              id: layerIdArrow,
              type: "symbol",
              source: sourceId,
              layout: {
                "symbol-placement": "line",
                "symbol-spacing": 50,       // Dày hơn (cũ là 100) -> Dễ thấy hơn
                "icon-image": "arrow-icon", // Dùng icon đã load
                "icon-size": 0.8,           // To hơn chút (0.8)
                "icon-allow-overlap": true, // QUAN TRỌNG: Cho phép đè lên nhau (ko bị ẩn)
                "icon-ignore-placement": true, // QUAN TRỌNG: Bỏ qua logic ẩn thông minh của map
                "icon-padding": 0,
                "icon-rotation-alignment": "map",
              },
              paint: {
                 "icon-opacity": 1 // Rõ nét nhất có thể
              }
            });
          }
          const bounds = new goongjs.LngLatBounds();
          fullRouteCoordinates.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 80 });
        }
      } catch (error) {
        console.error("Lỗi vẽ route:", error);
      }
    };

    drawRoute();
  }, [map, stops]);

  // 4. VẼ XE BUÝT (Giữ nguyên)
  useEffect(() => {
    if (!map) return;
    if (!busLocation) {
        if (busMarkerRef.current) {
            busMarkerRef.current.remove();
            busMarkerRef.current = null;
        }
        return;
    }

    const createBusElement = () => {
      const el = document.createElement("div");
      el.className = "bus-vehicle-marker";
      el.style.backgroundImage = "url(https://cdn-icons-png.flaticon.com/512/3448/3448339.png)";
      el.style.backgroundSize = "cover";
      el.style.width = "48px"; el.style.height = "48px"; el.style.zIndex = "20";
      el.style.filter = "drop-shadow(0px 4px 4px rgba(0,0,0,0.5))";
      if (busLocation.heading !== undefined) {
         el.style.transform = `rotate(${busLocation.heading}deg)`;
         el.style.transition = "transform 0.5s ease";
      }
      return el;
    };

    if (!busMarkerRef.current) {
      busMarkerRef.current = new goongjs.Marker({ element: createBusElement(), anchor: 'center' })
        .setLngLat([busLocation.longitude, busLocation.latitude])
        .addTo(map);
    } else {
      busMarkerRef.current.setLngLat([busLocation.longitude, busLocation.latitude]);
      if (busLocation.heading !== undefined) {
         const el = busMarkerRef.current.getElement();
         el.style.transform = `rotate(${busLocation.heading}deg)`;
      }
    }
  }, [map, busLocation]);

  return <div ref={mapContainerRef} className={className} />;
};

export default BusMap;