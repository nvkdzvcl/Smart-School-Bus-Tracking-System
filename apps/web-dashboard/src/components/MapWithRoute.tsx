import { useState, useEffect } from 'react'

interface Stop {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
}

interface MapWithRouteProps {
  stops: Stop[]
  selectedBus?: string
  routeName?: string
}

export default function MapWithRoute({ stops, selectedBus, routeName }: MapWithRouteProps) {
  const [mapUrl, setMapUrl] = useState('')

  // Dữ liệu mẫu tọa độ cho các điểm dừng ở TP.HCM
  const sampleCoordinates: Record<string, { lat: number, lng: number }> = {
    'Điểm dừng A': { lat: 10.8231, lng: 106.6297 },
    'Điểm dừng B': { lat: 10.8000, lng: 106.6500 },
    'Điểm dừng C': { lat: 10.7900, lng: 106.6700 },
    'Điểm dừng D': { lat: 10.7769, lng: 106.7009 },
    'Điểm dừng E': { lat: 10.7500, lng: 106.6800 },
    'Điểm dừng F': { lat: 10.7300, lng: 106.6900 },
    'Điểm dừng G': { lat: 10.8100, lng: 106.6400 },
    'Điểm dừng H': { lat: 10.7800, lng: 106.6600 },
    'Điểm dừng I': { lat: 10.7600, lng: 106.6750 }
  }

  useEffect(() => {
    if (stops.length === 0) {
      // Bản đồ mặc định TP.HCM
      setMapUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326002567447!2d106.69975731533414!3d10.776889992319095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x2b6c6b8c6b8c6b8c!2sHo%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635123456789!5m2!1sen!2s")
      return
    }

    // Tạo URL cho Google Maps Directions với các điểm dừng
    const stopsWithCoords = stops.map(stop => ({
      ...stop,
      ...sampleCoordinates[stop.name] || { lat: 10.8231, lng: 106.6297 }
    }))

    if (stopsWithCoords.length >= 2) {
      const origin = `${stopsWithCoords[0].lat},${stopsWithCoords[0].lng}`
      const destination = `${stopsWithCoords[stopsWithCoords.length - 1].lat},${stopsWithCoords[stopsWithCoords.length - 1].lng}`
      
      // Các điểm dừng ở giữa làm waypoints
      const waypoints = stopsWithCoords
        .slice(1, -1)
        .map(stop => `${stop.lat},${stop.lng}`)
        .join('|')

      // Tạo URL cho Google Maps Embed Directions API
      let directionsUrl = `https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${origin}&destination=${destination}&mode=driving`
      
      if (waypoints) {
        directionsUrl += `&waypoints=${waypoints}`
      }

      setMapUrl(directionsUrl)
    } else if (stopsWithCoords.length === 1) {
      // Chỉ có 1 điểm dừng, hiển thị place
      const placeUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${stopsWithCoords[0].lat},${stopsWithCoords[0].lng}&zoom=15`
      setMapUrl(placeUrl)
    }
  }, [stops])

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      {mapUrl ? (
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Route Map - ${routeName || 'Bus Route'}`}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Đang tải bản đồ...</p>
          </div>
        </div>
      )}
    </div>
  )
}