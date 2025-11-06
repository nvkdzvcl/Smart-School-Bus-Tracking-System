import MapWithRoute from '../components/MapWithRoute'

// Ví dụ sử dụng trong RouteManagement
const routeStops = [
  { id: '1', name: 'Điểm dừng A', address: '123 Đường ABC, Quận 1' },
  { id: '2', name: 'Điểm dừng B', address: '456 Đường DEF, Quận 1' },
  { id: '3', name: 'Điểm dừng C', address: '789 Đường GHI, Quận 1' }
]

export default function RouteMapExample() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bản đồ tuyến đường</h1>
      
      {/* Sử dụng component MapWithRoute */}
      <MapWithRoute 
        stops={routeStops}
        routeName="Tuyến 1"
      />
    </div>
  )
}