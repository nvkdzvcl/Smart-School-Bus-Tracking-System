import { useEffect, useState, useMemo } from 'react'
import { Bus, Users, GraduationCap, Route, AlertTriangle, CheckCircle } from 'lucide-react'
import { getAllBuses, getDrivers, getStudents, getRoutes } from '../lib/api'

const recentAlerts = [
  { id: 1, type: 'warning', message: 'Xe BUS-001 chậm 15 phút tại điểm dừng Trường THPT ABC', time: '10:30' },
  { id: 2, type: 'success', message: 'Tuyến đường số 5 hoàn thành chuyến đi sáng', time: '09:45' },
  { id: 3, type: 'warning', message: 'Tài xế Nguyễn Văn A báo cáo sự cố nhỏ', time: '08:20' }
]

export default function Dashboard() {
  const [stats, setStats] = useState({ buses: 0, drivers: 0, students: 0, routes: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const [buses, drivers, students, routes] = await Promise.all([
          getAllBuses(), getDrivers(), getStudents(), getRoutes()
        ])
        setStats({ buses: buses.length, drivers: drivers.length, students: students.length, routes: routes.length })
      } catch (e: any) { setError(e.message || 'Không tải được số liệu') } finally { setLoading(false) }
    }
    load()
  }, [])

  const statsData = useMemo(() => [
    { icon: Bus, label: 'Tổng số xe buýt', value: stats.buses, color: 'bg-blue-500' },
    { icon: Users, label: 'Tài xế hoạt động', value: stats.drivers, color: 'bg-green-500' },
    { icon: GraduationCap, label: 'Học sinh đăng ký', value: stats.students, color: 'bg-purple-500' },
    { icon: Route, label: 'Tuyến đường', value: stats.routes, color: 'bg-orange-500' }
  ], [stats])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-600 mt-2">Giám sát và quản lý hệ thống xe đưa đón học sinh</p>
        </div>
        <button
          onClick={() => {
            setLoading(true); setError(null)
            Promise.all([getAllBuses(), getDrivers(), getStudents(), getRoutes()])
              .then(([buses, drivers, students, routes]) => setStats({ buses: buses.length, drivers: drivers.length, students: students.length, routes: routes.length }))
              .catch(e => setError(e.message || 'Không tải được số liệu'))
              .finally(() => setLoading(false))
          }}
          className="btn-secondary"
        >Làm mới</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Recent Alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cảnh báo gần đây</h3>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
              {alert.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}