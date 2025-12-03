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
  heading?: number; // vẫn để type, nhưng không dùng cũng được
}

interface BusMapProps {
  stops: MapStop[];
  busLocation?: BusLocation | null;
  className?: string;
  showTraffic?: boolean;
  onRouteLoaded?: (coords: number[][]) => void;
}

// Icon bus (marker stop)
const BUS_ICON_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTQ4OCAxMjhoLThWODBjMC0yNi41LTIxLjUtNDgtNDgtNDhIODBjLTI2LjUgMC00OCAyMS41LTQ4IDQ4djQ4SDI0Yy0xMy4zIDAtMjQgMTAuNy0yNCAyNHY0OGMwIDEzLjMgMTAuNyAyNCAyNCAyNHYxNjBjMCAxNy43IDE0LjMgMzIgMzIgMzJoMzJjMTcuNyAwIDMyLTE0LjMgMzItMzJ2LTMyaDI3MnYzMmMwIDE3LjcgMTQuMyAzMiAzMiAzMmMzLjA5NiAwIDYtMS4zIDgtM3MxLTMuOTk2IDEtNnYtMTYwYzEzLjMgMCAyNC0xMC43IDI0LTI0di00OGMwLTEzLjMtMTAuNy0yNC0yNC0yNHpNMTI4IDQwMGMtMTcuNyAwLTMyLTE0LjMtMzItMzJzMTQuMy0zMiAzMi0zMiAzMiAxNC4zIDMyIDMyLTE0LjMgMzItMzIgMzJ6bTI1NiAwYy0xNy43IDAtMzItMTQuMy0zMi0zMnMxNC4zLTMyIDMyLTMyIDMyIDE0LjMgMzIgMzItMTQuMyAzMi0zMiAzMnptLTQxLjI4LTMyMEg2OS4yOGMtOC44MjggMC0xNi04LjQ4LTM0Ljg2LTlMMC4wMDggNzJjMC0xLjc2OC0uMTItMy40OTYgMS44ODgtNC40OTZDNC4wOTYgNjcuNjQ4IDguMDggNjguMTkyIDEyIDY4LjE5MmgzODhjMy45MiAwIDcuOTA0LS41NDQgMTAuMTEtMC42OTYgMi4wMDgtMS4wMDggMS44OS0yLjcyOCAxLjg5LTQuNDk2bC0zNC40MiAxLjAwOEM0MTAuMjggNTkuNTIgNDAyLjA4IDY4IDM5My4yOCA2OGgtNTkuNDh6Ii8+PC9zdmc+";

const ARROW_ICON_BASE64 =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z' fill='white' stroke='rgba(0,0,0,0.1)' stroke-width='1'/%3E%3C/svg%3E";

const BusMap: React.FC<BusMapProps> = ({
  stops,
  busLocation,
  className = "w-full h-[500px] rounded-lg shadow-md",
  onRouteLoaded,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const busMarkerRef = useRef<any>(null);
  const stopMarkersRef = useRef<any[]>([]);

  // 1. Khởi tạo map
  useEffect(() => {
    const mapTilesKey =
      import.meta.env?.VITE_GOONG_MAPTILES_KEY ||
      process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;
    if (!mapTilesKey) return;

    goongjs.accessToken = mapTilesKey;

    const defaultCenter = [106.660172, 10.762622];

    const initializedMap = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: defaultCenter,
      zoom: 13,
    });

    initializedMap.addControl(new goongjs.NavigationControl(), "top-right");

    initializedMap.on("load", () => {
      // load icon mũi tên (cho layer route)
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

  // 2. Markers stops
  useEffect(() => {
    if (!map) return;

    // clear cũ
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    if (!stops || stops.length === 0) return;

    const sortedStops = [...stops].sort((a, b) => a.stop_order - b.stop_order);

    sortedStops.forEach((stop) => {
      const isStart = stop.stop_order === 1;
      const isEnd = stop.stop_order === sortedStops.length;
      const bgColor = isStart ? "#10b981" : isEnd ? "#ef4444" : "#3b82f6";

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "36px",
        height: "36px",
        backgroundColor: bgColor,
        borderRadius: "50%",
        border: "3px solid white",
        boxShadow: "0 3px 5px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      } as CSSStyleDeclaration);

      const iconImg = document.createElement("img");
      iconImg.src = BUS_ICON_BASE64;
      Object.assign(iconImg.style, {
        width: "18px",
        height: "18px",
        display: "block",
        pointerEvents: "none",
      } as CSSStyleDeclaration);
      el.appendChild(iconImg);

      const badge = document.createElement("div");
      badge.innerText = stop.stop_order.toString();
      Object.assign(badge.style, {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        backgroundColor: "white",
        color: bgColor,
        fontWeight: "bold",
        fontSize: "11px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${bgColor}`,
        boxShadow: "0 2px 2px rgba(0,0,0,0.2)",
      } as CSSStyleDeclaration);
      el.appendChild(badge);

      const popup = new goongjs.Popup({
        offset: 25,
        closeButton: false,
      }).setText(stop.name);

      const marker = new goongjs.Marker({ element: el, anchor: "center" })
        .setLngLat([stop.longitude, stop.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("mouseenter", () => popup.addTo(map));
      el.addEventListener("mouseleave", () => popup.remove());

      stopMarkersRef.current.push(marker);
    });
  }, [map, stops]);

  // 3. Route từ Goong (vẽ line + mũi tên, đồng thời trả routeCoords ra ngoài)
  useEffect(() => {
    if (!map) return;

    const sourceId = "bus-route";
    const layerIdLine = "bus-route-line";
    const layerIdArrow = "bus-route-arrow";

    if (!stops || stops.length < 2) {
      if (map.getLayer(layerIdArrow)) map.removeLayer(layerIdArrow);
      if (map.getLayer(layerIdLine)) map.removeLayer(layerIdLine);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      if (onRouteLoaded) onRouteLoaded([]);
      return;
    }

    const drawRoute = async () => {
      const sortedStops = [...stops].sort(
        (a, b) => a.stop_order - b.stop_order
      );
      const apiKey =
        import.meta.env?.VITE_GOONG_API_KEY ||
        process.env.NEXT_PUBLIC_GOONG_API_KEY;

      const segments: { start: MapStop; end: MapStop }[] = [];
      for (let i = 0; i < sortedStops.length - 1; i++) {
        segments.push({ start: sortedStops[i], end: sortedStops[i + 1] });
      }

      try {
        const responses = await Promise.all(
          segments.map((segment) => {
            const originStr = `${segment.start.latitude},${segment.start.longitude}`;
            const destStr = `${segment.end.latitude},${segment.end.longitude}`;
            const url = `https://rsapi.goong.io/Direction?origin=${originStr}&destination=${destStr}&vehicle=car&api_key=${apiKey}`;
            return fetch(url).then((res) => res.json());
          })
        );

        let fullRouteCoordinates: number[][] = [];

        responses.forEach((data) => {
          if (data.routes && data.routes.length > 0) {
            const coords = polyline
              .decode(data.routes[0].overview_polyline.points)
              .map((pair: number[]) => [pair[1], pair[0]]); // [lng, lat]
            fullRouteCoordinates = fullRouteCoordinates.concat(coords);
          }
        });

        if (!fullRouteCoordinates.length) {
          if (onRouteLoaded) onRouteLoaded([]);
          return;
        }

        if (onRouteLoaded) onRouteLoaded(fullRouteCoordinates);

        const data = {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: fullRouteCoordinates,
          },
        };

        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as any).setData(data);
        } else {
          map.addSource(sourceId, { type: "geojson", data });

          map.addLayer({
            id: layerIdLine,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#10b981",
              "line-width": 6,
            },
          });

          map.addLayer({
            id: layerIdArrow,
            type: "symbol",
            source: sourceId,
            layout: {
              "symbol-placement": "line",
              "symbol-spacing": 50,
              "icon-image": "arrow-icon",
              "icon-size": 0.8,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "icon-rotation-alignment": "map",
            },
            paint: {
              "icon-opacity": 1,
            },
          });
        }

        const bounds = new goongjs.LngLatBounds();
        fullRouteCoordinates.forEach((c) => bounds.extend(c));
        map.fitBounds(bounds, { padding: 80 });
      } catch (err) {
        console.error("Lỗi vẽ route:", err);
      }
    };

    drawRoute();
  }, [map, stops]); // 🔴 chỉ phụ thuộc map + stops

  // 4. Marker xe buýt – CHỈ DI CHUYỂN, KHÔNG XOAY
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
      el.style.backgroundImage =
        "url(https://cdn-icons-png.flaticon.com/512/3448/3448339.png)";
      el.style.backgroundSize = "cover";
      el.style.width = "48px";
      el.style.height = "48px";
      el.style.filter = "drop-shadow(0px 4px 4px rgba(0,0,0,0.5))";
      el.style.zIndex = "10";
      return el;
    };

    if (!busMarkerRef.current) {
      busMarkerRef.current = new goongjs.Marker({
        element: createBusElement(),
        anchor: "center",
      })
        .setLngLat([busLocation.longitude, busLocation.latitude])
        .addTo(map);
    } else {
      busMarkerRef.current.setLngLat([
        busLocation.longitude,
        busLocation.latitude,
      ]);
    }
  }, [map, busLocation]);

  return <div ref={mapContainerRef} className={className} />;
};

export default BusMap;
