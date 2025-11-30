import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { getTripAlerts, TripAlert } from '../lib/api'

interface BusLocation {
  id: string
  licensePlate: string
  route: string
  driver: string
  currentLocation: string
  status: 'moving' | 'stopped' | 'delayed' | 'completed'
  studentsOnBoard: number
  lastUpdate: string
  nextStop: string
  estimatedArrival: string
}

const mockBusLocations: BusLocation[] = [
  {
    id: '1',
    licensePlate: '29A-12345',
    route: 'Tuyến 1',
    driver: 'Nguyễn Văn A',
    currentLocation: 'Đang di chuyển trên Đường ABC',
    status: 'moving',
    studentsOnBoard: 28,
    lastUpdate: '10:32:15',
    nextStop: 'Điểm dừng B',
    estimatedArrival: '10:45'
  },
  {
    id: '2',
    licensePlate: '29B-67890',
    route: 'Tuyến 2',
    driver: 'Trần Thị B',
    currentLocation: 'Tại Điểm dừng D',
    status: 'stopped',
    studentsOnBoard: 15,
    lastUpdate: '10:30:22',
    nextStop: 'Điểm dừng E',
    estimatedArrival: '10:50'
  },
  {
    id: '3',
    licensePlate: '29C-11111',
    route: 'Tuyến 3',
    driver: 'Lê Văn C',
    currentLocation: 'Đang di chuyển trên Đường XYZ',
    status: 'delayed',
    studentsOnBoard: 32,
    lastUpdate: '10:28:45',
    nextStop: 'Điểm dừng G',
    estimatedArrival: '11:00'
  },
  {
    id: '4',
    licensePlate: '29D-22222',
    route: 'Tuyến 4',
    driver: 'Phạm Văn D',
    currentLocation: 'Đã hoàn thành chuyến đi',
    status: 'completed',
    studentsOnBoard: 0,
    lastUpdate: '10:15:30',
    nextStop: '-',
    estimatedArrival: '-'
  }
]

export default function RealTimeTracking() {
  const [busLocations, setBusLocations] = useState<BusLocation[]>(mockBusLocations)
  const [selectedBus, setSelectedBus] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [alerts, setAlerts] = useState<TripAlert[]>([])
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [errorAlerts, setErrorAlerts] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true)
    setErrorAlerts(null)
    try {
      const data = await getTripAlerts()
      setAlerts(data)
    } catch (e: any) {
      setErrorAlerts(e.message || 'Không tải được cảnh báo')
    } finally {
      setLoadingAlerts(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => {
      fetchAlerts()
    }, 30000) // 30s
    return () => clearInterval(id)
  }, [autoRefresh, fetchAlerts])

  const handleRefresh = () => {
    fetchAlerts()
  }

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return iso
    }
  }

  const badgeColor = (type: TripAlert['type']) => {
    switch (type) {
      case 'delay':
        return 'bg-yellow-500'
      case 'pickup_complete':
        return 'bg-blue-500'
      case 'dropoff_complete':
        return 'bg-indigo-500'
      case 'trip_complete':
        return 'bg-green-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Theo dõi Thời gian thực</h1>
          <p className="text-gray-600 mt-2">Giám sát vị trí và trạng thái của tất cả xe buýt</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700">
              Tự động cập nhật
            </label>
          </div>
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={"w-4 h-4 " + (loadingAlerts ? 'animate-spin' : '')} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bản đồ theo dõi</h3>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Chọn biển số xe</option>
              {busLocations.map(bus => (
                <option key={bus.id} value={bus.id}>
                  {bus.licensePlate}
                </option>
              ))}
            </select>
          </div>

          {/* Google Maps with Route */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            {selectedBus ? (
              <iframe
                src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=10.8231,106.6297&destination=10.7769,106.7009&waypoints=10.8000,106.6500|10.7900,106.6700&mode=driving`}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '0.5rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bus Route Map"
              />
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326002567447!2d106.69975731533414!3d10.776889992319095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x2b6c6b8c6b8c6b8c!2sHo%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635123456789!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '0.5rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bus Tracking Map"
              />
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cảnh báo gần đây</h3>
          {errorAlerts && <div className="text-sm text-red-600 mb-3">{errorAlerts}</div>}
          {loadingAlerts && alerts.length === 0 && (
            <div className="text-sm text-gray-500">Đang tải cảnh báo...</div>
          )}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${badgeColor(alert.type)}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(alert.time)}</p>
                </div>
              </div>
            ))}
            {!loadingAlerts && alerts.length === 0 && !errorAlerts && (
              <div className="text-sm text-gray-500">Chưa có cảnh báo nào.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}