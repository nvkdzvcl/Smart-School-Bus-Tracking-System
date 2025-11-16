import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";

type LatLng = { lat: number; lng: number };
interface Props {
  dest: LatLng;          // điểm dừng hiện tại/tiếp theo
  running?: boolean;     // đang chạy thì vẽ route
}

const containerStyle = { width: "100%", height: "100%" }; // fill parent

export default function MapView({ dest, running }: Props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Theo dõi vị trí hiện tại
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}, // im lặng
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Tính route khi có origin + running
  useEffect(() => {
    if (!isLoaded || !running || !origin) return;

    const svc = new google.maps.DirectionsService();
    svc.route(
      {
        origin,
        destination: dest,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === "OK" && res) setDirections(res);
        else setDirections(null);
      }
    );
  }, [isLoaded, origin, dest, running]);

  const center = useMemo<LatLng>(() => origin ?? dest, [origin, dest]);

  if (loadError) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-destructive">Không tải được Google Maps</div>;
  }
  if (!isLoaded) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Đang tải bản đồ…</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
    >
      {origin && <Marker position={origin} title="Vị trí hiện tại" />}
      <Marker position={dest} title="Điểm dừng" />
      {running && directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
