import { useEffect, useMemo, useState } from 'react'
import { Bus, Users, GraduationCap, Route as RouteIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getAllBuses, getDrivers, getStudents, getRoutes } from '../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, Tooltip } from 'recharts'

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

  const kpis = useMemo(() => ([
    { icon: Bus, label: 'Tổng số xe buýt', value: stats.buses, deltaText: '↑ 2 xe mới tháng này', deltaPos: true, color: 'bg-blue-500' },
    { icon: Users, label: 'Tài xế hoạt động', value: stats.drivers, deltaText: '98% đang trực tuyến', deltaPos: true, color: 'bg-green-500' },
    { icon: GraduationCap, label: 'Học sinh đăng ký', value: stats.students, deltaText: '↑ 15 học sinh mới', deltaPos: true, color: 'bg-purple-500' },
    { icon: RouteIcon, label: 'Tuyến đường', value: stats.routes, deltaText: '100% hoạt động', deltaPos: true, color: 'bg-orange-500' },
  ]), [stats])

  const onTimeData = [
    { name: 'Đúng giờ', value: 85, color: '#16a34a' },
    { name: 'Trễ nhẹ <15p', value: 10, color: '#f59e0b' },
    { name: 'Trễ >15p', value: 5, color: '#ef4444' },
  ]

  const ridershipData = [
    { name: 'Thứ 2', Sáng: 320, Chiều: 300 },
    { name: 'Thứ 3', Sáng: 340, Chiều: 310 },
    { name: 'Thứ 4', Sáng: 350, Chiều: 330 },
    { name: 'Thứ 5', Sáng: 360, Chiều: 340 },
    { name: 'Thứ 6', Sáng: 370, Chiều: 350 },
  ]

  const incidentsTrend = [
    { day: 'T-6', total: 3 },
    { day: 'T-5', total: 5 },
    { day: 'T-4', total: 4 },
    { day: 'T-3', total: 6 },
    { day: 'T-2', total: 7 },
    { day: 'T-1', total: 5 },
    { day: 'T', total: 4 },
  ]

  const hotRoutes = [
    { route: 'Tuyến số 05', incidents: 12, level: 'orange' },
    { route: 'Tuyến số 12', incidents: 8, level: 'yellow' },
    { route: 'Tuyến số 01', incidents: 2, level: 'green' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-600 mt-2">Giám sát và quản lý hệ thống xe đưa đón học sinh</p>
        </div>
        <button
          onClick={async () => {
            setLoading(true); setError(null)
            try {
              const [buses, drivers, students, routes] = await Promise.all([
                getAllBuses(), getDrivers(), getStudents(), getRoutes()
              ])
              setStats({ buses: buses.length, drivers: drivers.length, students: students.length, routes: routes.length })
            } catch (e: any) { setError(e.message || 'Không tải được số liệu') } finally { setLoading(false) }
          }}
          className="btn-secondary"
        >Làm mới</button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <div key={i} className="card">
              <div className="flex items-center">
                <div className={`${k.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{k.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : k.value}</p>
                  <div className={`mt-1 inline-flex items-center text-xs ${k.deltaPos ? 'text-green-600' : 'text-red-600'}`}>
                    {k.deltaPos ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {k.deltaText}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ đúng giờ</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={onTimeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {onTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-green-600">85%</span>
            <span className="text-sm text-gray-500 ml-2">Đúng giờ</span>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lượng học sinh theo tuần</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={ridershipData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Sáng" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Chiều" stackId="a" fill="#fb923c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Phân tích sự cố (7 ngày)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={incidentsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded">Tai nạn/Va chạm (Thấp)</span>
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded">Kẹt xe/Trễ giờ (Cao)</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">Quên đồ/Vắng mặt (Trung bình)</span>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top tuyến đường nóng</h3>
          <div className="space-y-3">
            {hotRoutes.map(hr => (
              <div key={hr.route} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{hr.route}</span>
                  <span className="text-xs text-gray-600">{hr.incidents} sự cố</span>
                </div>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded ${hr.level === 'orange' ? 'bg-orange-400' : hr.level === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, hr.incidents * 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}