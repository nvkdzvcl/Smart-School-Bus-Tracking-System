import { useEffect, useRef } from 'react'

interface Stop {
  id: string
  name: string
  lat: number
  lng: number
}

interface GoogleMapProps {
  stops: Stop[]
  selectedRoute?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function GoogleMap({ stops, selectedRoute }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`
      script.async = true
      script.defer = true
      
      window.initMap = initializeMap
      document.head.appendChild(script)
    } else {
      initializeMap()
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && stops.length > 0) {
      drawRoute()
    }
  }, [stops, selectedRoute])

  const initializeMap = () => {
    if (!mapRef.current) return

    // Tạo bản đồ tại TP.HCM
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 10.8231, lng: 106.6297 }, // TP.HCM
      mapTypeId: 'roadmap'
    })

    mapInstanceRef.current = map
    
    if (stops.length > 0) {
      drawRoute()
    }
  }

  const drawRoute = () => {
    if (!mapInstanceRef.current || stops.length === 0) return

    const map = mapInstanceRef.current

    // Xóa các marker và polyline cũ
    // (Trong thực tế, bạn nên lưu trữ references để xóa)

    // Tạo markers cho các điểm dừng
    const markers = stops.map((stop, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: map,
        title: stop.name,
        label: (index + 1).toString(),
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0C6.7 0 0 6.7 0 15c0 8.3 15 25 15 25s15-16.7 15-25C30 6.7 23.3 0 15 0z" fill="#3b82f6"/>
              <circle cx="15" cy="15" r="8" fill="white"/>
              <text x="15" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#3b82f6">${index + 1}</text>
            </svg>
          `)
        }
      })

      // Thêm info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${stop.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">Điểm dừng thứ ${index + 1}</p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      return marker
    })

    // Vẽ đường line nối các điểm dừng
    if (stops.length > 1) {
      const routePath = stops.map(stop => ({ lat: stop.lat, lng: stop.lng }))
      
      const polyline = new window.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: '#3b82f6', // Màu xanh primary
        strokeOpacity: 1.0,
        strokeWeight: 4
      })

      polyline.setMap(map)

      // Fit map để hiển thị tất cả điểm dừng
      const bounds = new window.google.maps.LatLngBounds()
      stops.forEach(stop => {
        bounds.extend({ lat: stop.lat, lng: stop.lng })
      })
      map.fitBounds(bounds)
    }
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg"
      style={{ minHeight: '400px' }}
    />
  )
}