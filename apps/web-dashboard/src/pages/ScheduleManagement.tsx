import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Edit, Trash2, Search, Clock, User, Bus,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import { getTrips, getDrivers, getAllBuses, getRoutes, createTrip, updateTrip, deleteTrip, Trip } from '../lib/api'

interface Schedule {
  id: string
  routeName: string
  driverName: string
  busLicensePlate: string
  startTime: string
  date: string
  type: 'morning' | 'afternoon'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  studentsCount: number
}

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([])
  const [buses, setBuses] = useState<{ id: string; licensePlate: string }[]>([])
  const [routes, setRoutes] = useState<{ id: string; name: string }[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Pagination State
  const [page, setPage] = useState(1)
  const pageSize = 6 // Hiển thị 6 card mỗi trang

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  // add modal form state
  const [addRouteId, setAddRouteId] = useState<string | undefined>(undefined)
  const [addTripDate, setAddTripDate] = useState<string>('')
  const [addSession, setAddSession] = useState<'morning' | 'afternoon'>('morning')
  const [addType, setAddType] = useState<'pickup' | 'dropoff'>('pickup')
  const [addStartTime, setAddStartTime] = useState<string>('')
  const [addDriverId, setAddDriverId] = useState<string | undefined>(undefined)
  const [addBusId, setAddBusId] = useState<string | undefined>(undefined)
  const [addLoading, setAddLoading] = useState(false)

  // edit modal form state
  const [editRouteId, setEditRouteId] = useState<string | undefined>(undefined)
  const [editTripDate, setEditTripDate] = useState<string>('')
  const [editSession, setEditSession] = useState<'morning' | 'afternoon' | undefined>(undefined)
  const [editStatus, setEditStatus] = useState<string>('')
  const [editStartTime, setEditStartTime] = useState<string>('')
  const [editDriverId, setEditDriverId] = useState<string | undefined>(undefined)
  const [editBusId, setEditBusId] = useState<string | undefined>(undefined)
  const [editLoading, setEditLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch'
      case 'in_progress': return 'Đang thực hiện'
      case 'completed': return 'Hoàn thành'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    return type === 'morning' ? 'Sáng' : 'Chiều'
  }
  const getTypeColor = (type: string) => {
    return type === 'morning' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
  }

  // --- LOGIC SEARCH & FILTER ---
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const matchesSearch = schedule.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.busLicensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !dateFilter || schedule.date === dateFilter
      const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter
      const matchesType = typeFilter === 'all' || schedule.type === typeFilter
      return matchesSearch && matchesDate && matchesStatus && matchesType
    })
  }, [schedules, searchTerm, dateFilter, statusFilter, typeFilter])

  // --- LOGIC PHÂN TRANG ---
  const maxPage = Math.max(1, Math.ceil(filteredSchedules.length / pageSize))

  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredSchedules.slice(start, start + pageSize)
  }, [filteredSchedules, page])

  const resetPage = () => setPage(1)

  // --- Handlers ---

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    const currentRoute = routes.find(r => r.name === schedule.routeName)
    const currentDriver = drivers.find(d => d.name === schedule.driverName)
    const currentBus = buses.find(b => b.licensePlate === schedule.busLicensePlate)
    setEditRouteId(currentRoute?.id)
    setEditTripDate(schedule.date)
    setEditSession(schedule.type)
    setEditStatus(schedule.status)
    setEditDriverId(currentDriver?.id)
    setEditBusId(currentBus?.id)
    setEditRouteId(currentRoute?.id)
    setEditingSchedule(schedule)
    setEditStartTime(schedule.startTime || '');
    setShowEditModal(true)
  }

  const handleSaveEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSchedule || !editRouteId) return alert('Dữ liệu không hợp lệ.')
    setEditLoading(true); setError(null);
    try {
      const updateData = {
        routeId: editRouteId,
        driverId: editDriverId,
        busId: editBusId,
        tripDate: editTripDate,
        session: editSession,
        status: editStatus,
        startTime: editStartTime,
        type: editingSchedule.type as any
      }
      await updateTrip(editingSchedule.id, updateData as any)
      setShowEditModal(false)
      setEditingSchedule(null)
      await loadData()
    } catch (err: any) {
      const msg = (err && err.message) ? String(err.message) : 'Cập nhật lịch trình thất bại!'
      alert(msg)
    } finally { setEditLoading(false) }
  }

  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa lịch trình của tuyến "${schedule.routeName}" ngày ${schedule.date}?`)) {
      return
    }
    try {
      await deleteTrip(schedule.id)
      // Nếu xóa item cuối cùng của trang hiện tại, lùi về trang trước
      if (paginatedSchedules.length === 1 && page > 1) {
        setPage(p => p - 1)
      }
      await loadData()
    } catch (e: any) {
      alert(e.message || 'Xóa lịch trình thất bại!')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const [autoRefresh] = useState(true)
  const POLL_INTERVAL_MS = 8000

  const loadData = async (isBackground = false) => {
    // --- SỬA Ở ĐÂY: Chỉ hiện loading nếu KHÔNG phải chạy ngầm ---
    if (!isBackground) {
      setLoading(true)
    }

    setError(null)
    try {
      const [tripList, driverList, busList, routeList] = await Promise.all([
        getTrips(),
        getDrivers(),
        getAllBuses(),
        getRoutes()
      ])

      const mappedSchedules: Schedule[] = tripList.map((t: Trip) => {
        const rawTime = (t as any).startTime || (t as any).plannedStartTime || (t as any).scheduledStartTime;
        let displayTime = '';
        if (rawTime) {
          if (typeof rawTime === 'string' && rawTime.includes(':') && rawTime.length <= 8) {
            displayTime = rawTime.substring(0, 5);
          } else {
            try {
              const d = new Date(rawTime);
              if (!isNaN(d.getTime())) {
                displayTime = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
              }
            } catch (e) { console.error('Lỗi parse giờ:', e) }
          }
        }

        return {
          id: String(t.id),
          routeName: t.route?.name || '',
          driverName: t.driver?.fullName || '',
          busLicensePlate: t.bus?.licensePlate || '',
          startTime: displayTime,
          date: t.tripDate,
          type: t.session,
          status: t.status,
          studentsCount: (t as any).studentCount || (t as any).students?.length || 0
        }
      })

      setSchedules(mappedSchedules)
      setDrivers(driverList.map(d => ({ id: String(d.id), name: d.fullName })))
      setBuses(busList.map(b => ({ id: String(b.id), licensePlate: b.licensePlate })))
      setRoutes(routeList.map(r => ({ id: String(r.id), name: r.name })))
    } catch (e: any) {
      setError(e?.message || 'Không thể tải dữ liệu')
    } finally {
      // Luôn đảm bảo tắt loading khi xong việc
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    loadData(false) // Lần đầu: false để hiện loading

    if (!autoRefresh) return
    const iv = setInterval(() => {
      if (!mounted) return
      loadData(true) // Lặp lại: true để chạy ngầm (không hiện loading)
    }, POLL_INTERVAL_MS)

    return () => { mounted = false; clearInterval(iv) }
  }, [autoRefresh])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Lịch trình</h1>
          <p className="text-gray-600 mt-2">Chỉ định tài xế, tuyến đường và thời gian bắt đầu</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lịch trình</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              aria-label="Tìm kiếm"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPage() }} // Reset Page
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <input
            type="date"
            aria-label="Lọc theo ngày"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); resetPage() }} // Reset Page
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            aria-label="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPage() }} // Reset Page
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            aria-label="Lọc theo ca"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); resetPage() }} // Reset Page
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tất cả ca</option>
            <option value="morning">Ca sáng</option>
            <option value="afternoon">Ca chiều</option>
          </select>
          <button className="btn-secondary">
            Xuất lịch trình
          </button>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && <div className="col-span-full text-center text-sm text-gray-500">Đang tải dữ liệu...</div>}

        {/* Render từ Paginated Schedules */}
        {!loading && paginatedSchedules.map((schedule) => (
          <div key={schedule.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{schedule.routeName}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(schedule.type)}`}>
                    {getTypeText(schedule.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{formatDate(schedule.date)}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(schedule.status)}`}>
                  {getStatusText(schedule.status)}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditSchedule(schedule)}
                  className="text-primary-600 hover:text-primary-900"
                  aria-label="Chỉnh sửa lịch trình"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSchedule(schedule)}
                  className="text-red-600 hover:text-red-900" aria-label="Xóa lịch trình">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Time */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Bắt đầu: {schedule.startTime || '—'}</span>
              </div>

              {/* Driver */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Tài xế: {schedule.driverName}</span>
              </div>

              {/* Bus */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Bus className="w-4 h-4" />
                <span>Xe: {schedule.busLicensePlate}</span>
              </div>

              {/* Students */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Số học sinh: {schedule.studentsCount}</span>
                {schedule.status === 'scheduled' && (
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Bắt đầu chuyến đi
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- PAGINATION FOOTER (MỚI) --- */}
      {!loading && filteredSchedules.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-200 pt-6 text-sm">
          <div className="text-gray-600">Hiển thị <b>{paginatedSchedules.length}</b> / <b>{filteredSchedules.length}</b> lịch trình</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 shadow-sm"
              title="Trang đầu"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </button>
            <span className="text-gray-700 mx-2">Trang <b>{page}</b> / <b>{maxPage}</b></span>
            <button
              onClick={() => setPage(p => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50 shadow-sm"
            >
              Sau <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(maxPage)}
              disabled={page >= maxPage}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 shadow-sm"
              title="Trang cuối"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm lịch trình mới</h3>
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              if (!addRouteId) return alert('Chọn tuyến');
              if (!addTripDate) return alert('Chọn ngày');
              setAddLoading(true); setError(null);
              try {
                await createTrip({ routeId: addRouteId, busId: addBusId, driverId: addDriverId, tripDate: addTripDate, session: addSession, type: addType, startTime: addStartTime })
                setShowAddModal(false)
                // reset form
                setAddRouteId(undefined); setAddTripDate(''); setAddSession('morning'); setAddType('pickup'); setAddStartTime(''); setAddDriverId(undefined); setAddBusId(undefined)
                // refresh data, reset page
                await loadData()
                resetPage()
              } catch (err: any) {
                const msg = (err && err.message) ? String(err.message) : ''
                if (msg.toLowerCase().includes('conflicting')) {
                  alert('Lịch bị trùng với lịch khác. Vui lòng kiểm tra thông tin và thử lại.')
                } else {
                  alert(msg || 'Tạo lịch thất bại')
                }
              } finally { setAddLoading(false) }
            }}>
              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuyến đường
                    </label>
                    <select value={addRouteId || ''} onChange={e => setAddRouteId(e.target.value || undefined)} aria-label="Tuyến đường" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Chọn tuyến đường</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>{route.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày
                    </label>
                    <input
                      type="date"
                      aria-label="Ngày"
                      value={addTripDate}
                      onChange={e => setAddTripDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ca làm việc
                    </label>
                    <select value={addSession} onChange={e => setAddSession(e.target.value as 'morning' | 'afternoon')} aria-label="Ca làm việc" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="morning">Ca sáng</option>
                      <option value="afternoon">Ca chiều</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select value={addType} onChange={e => setAddType(e.target.value as 'pickup' | 'dropoff')} aria-label="Loại chuyến" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="pickup">Đón</option>
                      <option value="dropoff">Trả</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Time */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thời gian</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="time"
                    aria-label="Thời gian bắt đầu"
                    value={addStartTime}
                    onChange={e => setAddStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Assignment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Phân công</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tài xế
                    </label>
                    <select value={addDriverId || ''} onChange={e => setAddDriverId(e.target.value || undefined)} aria-label="Tài xế" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Chọn tài xế</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xe buýt
                    </label>
                    <select value={addBusId || ''} onChange={e => setAddBusId(e.target.value || undefined)} aria-label="Xe buýt" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Chọn xe buýt</option>
                      {buses.map(bus => (
                        <option key={bus.id} value={bus.id}>{bus.licensePlate}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addLoading}
                >
                  {addLoading ? 'Đang lưu...' : 'Thêm lịch trình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa lịch trình</h3>
            <form className="space-y-6" onSubmit={handleSaveEditSchedule}>
              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuyến đường
                    </label>
                    <select
                      value={editRouteId || ''}
                      onChange={e => setEditRouteId(e.target.value || undefined)}
                      aria-label="Tuyến đường"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn tuyến đường</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>{route.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày
                    </label>
                    <input
                      type="date"
                      value={editTripDate} onChange={e => setEditTripDate(e.target.value)}
                      aria-label="Ngày"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ca làm việc
                    </label>
                    <select
                      value={editSession}
                      onChange={e => setEditSession(e.target.value as 'morning' | 'afternoon')}
                      aria-label="Ca làm việc"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="morning">Ca sáng</option>
                      <option value="afternoon">Ca chiều</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={editStatus} onChange={e => setEditStatus(e.target.value)}
                      aria-label="Trạng thái"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="scheduled">Đã lên lịch</option>
                      <option value="in_progress">Đang thực hiện</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Time */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thời gian</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="time"
                    value={editStartTime} onChange={e => setEditStartTime(e.target.value)}
                    aria-label="Thời gian bắt đầu"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Assignment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Phân công</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tài xế
                    </label>
                    <select
                      value={editDriverId || ''}
                      onChange={e => setEditDriverId(e.target.value || undefined)}
                      aria-label="Tài xế"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn tài xế</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xe buýt
                    </label>
                    <select
                      value={editBusId || ''}
                      onChange={e => setEditBusId(e.target.value || undefined)}
                      aria-label="Xe buýt"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn xe buýt</option>
                      {buses.map(bus => (
                        <option key={bus.id} value={bus.id}>{bus.licensePlate}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSchedule(null)
                  }}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
