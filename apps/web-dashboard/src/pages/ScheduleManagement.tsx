import { useState } from 'react'
import { Plus, Edit, Trash2, Search, Calendar, Clock, User, Bus } from 'lucide-react'

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

const mockSchedules: Schedule[] = [
  {
    id: '1',
    routeName: 'Tuyến 1',
    driverName: 'Nguyễn Văn A',
    busLicensePlate: '29A-12345',
    startTime: '07:00',
    date: '2024-10-30',
    type: 'morning',
    status: 'completed',
    studentsCount: 28
  },
  {
    id: '2',
    routeName: 'Tuyến 2',
    driverName: 'Trần Thị B',
    busLicensePlate: '29B-67890',
    startTime: '07:15',
    date: '2024-10-30',
    type: 'morning',
    status: 'in_progress',
    studentsCount: 32
  },
  {
    id: '3',
    routeName: 'Tuyến 1',
    driverName: 'Nguyễn Văn A',
    busLicensePlate: '29A-12345',
    startTime: '15:30',
    date: '2024-10-30',
    type: 'afternoon',
    status: 'scheduled',
    studentsCount: 28
  },
  {
    id: '4',
    routeName: 'Tuyến 3',
    driverName: 'Lê Văn C',
    busLicensePlate: '29C-11111',
    startTime: '07:30',
    date: '2024-10-31',
    type: 'morning',
    status: 'scheduled',
    studentsCount: 25
  }
]

const mockDrivers = [
  { id: '1', name: 'Nguyễn Văn A' },
  { id: '2', name: 'Trần Thị B' },
  { id: '3', name: 'Lê Văn C' },
  { id: '4', name: 'Phạm Văn D' }
]

const mockBuses = [
  { id: '1', licensePlate: '29A-12345' },
  { id: '2', licensePlate: '29B-67890' },
  { id: '3', licensePlate: '29C-11111' },
  { id: '4', licensePlate: '29D-22222' }
]

const mockRoutes = [
  { id: '1', name: 'Tuyến 1' },
  { id: '2', name: 'Tuyến 2' },
  { id: '3', name: 'Tuyến 3' },
  { id: '4', name: 'Tuyến 4' }
]

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

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

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.busLicensePlate.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || schedule.date === dateFilter
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter
    const matchesType = typeFilter === 'all' || schedule.type === typeFilter
    return matchesSearch && matchesDate && matchesStatus && matchesType
  })

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setShowEditModal(true)
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
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
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
        {filteredSchedules.map((schedule) => (
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
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Time */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Bắt đầu: {schedule.startTime}</span>
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

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm lịch trình mới</h3>
            <form className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuyến đường
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Chọn tuyến đường</option>
                      {mockRoutes.map(route => (
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ca làm việc
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="morning">Ca sáng</option>
                      <option value="afternoon">Ca chiều</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="scheduled">Đã lên lịch</option>
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
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Chọn tài xế</option>
                      {mockDrivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xe buýt
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Chọn xe buýt</option>
                      {mockBuses.map(bus => (
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
                >
                  Thêm lịch trình
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
            <form className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuyến đường
                    </label>
                    <select 
                      defaultValue={editingSchedule.routeName}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn tuyến đường</option>
                      {mockRoutes.map(route => (
                        <option key={route.id} value={route.name}>{route.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày
                    </label>
                    <input
                      type="date"
                      defaultValue={editingSchedule.date}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ca làm việc
                    </label>
                    <select 
                      defaultValue={editingSchedule.type}
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
                      defaultValue={editingSchedule.status}
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
                    defaultValue={editingSchedule.startTime}
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
                      defaultValue={editingSchedule.driverName}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn tài xế</option>
                      {mockDrivers.map(driver => (
                        <option key={driver.id} value={driver.name}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xe buýt
                    </label>
                    <select 
                      defaultValue={editingSchedule.busLicensePlate}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn xe buýt</option>
                      {mockBuses.map(bus => (
                        <option key={bus.id} value={bus.licensePlate}>{bus.licensePlate}</option>
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
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}