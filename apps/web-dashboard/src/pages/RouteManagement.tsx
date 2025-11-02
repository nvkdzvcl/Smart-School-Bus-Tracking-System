import { useState } from 'react'
import { Plus, Edit, Trash2, Search, MapPin, Users, GraduationCap } from 'lucide-react'

interface Stop {
  id: string
  name: string
  address: string
}

interface Route {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  stops: Stop[]
  studentCount: number
}

interface Student {
  id: string
  name: string
  grade: string
  class: string
  parentName: string
  parentPhone: string
  stopName: string
}

const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Tuyến 1',
    description: 'Tuyến đường khu vực trung tâm',
    status: 'active',
    studentCount: 45,
    stops: [
      { id: '1', name: 'Điểm dừng A', address: '123 Đường ABC, Quận 1' },
      { id: '2', name: 'Điểm dừng B', address: '456 Đường DEF, Quận 1' },
      { id: '3', name: 'Điểm dừng C', address: '789 Đường GHI, Quận 1' }
    ]
  },
  {
    id: '2',
    name: 'Tuyến 2',
    description: 'Tuyến đường khu vực phía Bắc',
    status: 'active',
    studentCount: 38,
    stops: [
      { id: '4', name: 'Điểm dừng D', address: '321 Đường JKL, Quận 2' },
      { id: '5', name: 'Điểm dừng E', address: '654 Đường MNO, Quận 2' },
      { id: '6', name: 'Điểm dừng F', address: '987 Đường PQR, Quận 2' }
    ]
  }
]

// Danh sách điểm dừng có sẵn
const availableStops: Stop[] = [
  { id: 'stop1', name: 'Điểm dừng A', address: '123 Đường ABC, Quận 1' },
  { id: 'stop2', name: 'Điểm dừng B', address: '456 Đường DEF, Quận 1' },
  { id: 'stop3', name: 'Điểm dừng C', address: '789 Đường GHI, Quận 1' },
  { id: 'stop4', name: 'Điểm dừng D', address: '321 Đường JKL, Quận 2' },
  { id: 'stop5', name: 'Điểm dừng E', address: '654 Đường MNO, Quận 2' },
  { id: 'stop6', name: 'Điểm dừng F', address: '987 Đường PQR, Quận 2' },
  { id: 'stop7', name: 'Điểm dừng G', address: '111 Đường STU, Quận 3' },
  { id: 'stop8', name: 'Điểm dừng H', address: '222 Đường VWX, Quận 3' },
  { id: 'stop9', name: 'Điểm dừng I', address: '333 Đường YZ, Quận 3' }
]

const mockStudentsByRoute: Record<string, Student[]> = {
  '1': [
    {
      id: '1',
      name: 'Nguyễn Minh An',
      grade: '6',
      class: '6A1',
      parentName: 'Nguyễn Văn Bình',
      parentPhone: '0901111111',
      stopName: 'Điểm dừng A'
    },
    {
      id: '2',
      name: 'Trần Thị Bảo',
      grade: '7',
      class: '7B2',
      parentName: 'Trần Văn Cường',
      parentPhone: '0902222222',
      stopName: 'Điểm dừng B'
    },
    {
      id: '3',
      name: 'Lê Hoàng Dũng',
      grade: '8',
      class: '8C1',
      parentName: 'Lê Thị Hoa',
      parentPhone: '0903333333',
      stopName: 'Điểm dừng A'
    },
    {
      id: '4',
      name: 'Phạm Thị Mai',
      grade: '6',
      class: '6A2',
      parentName: 'Phạm Văn Nam',
      parentPhone: '0904444444',
      stopName: 'Điểm dừng C'
    }
  ],
  '2': [
    {
      id: '5',
      name: 'Võ Minh Khang',
      grade: '7',
      class: '7A1',
      parentName: 'Võ Thị Lan',
      parentPhone: '0905555555',
      stopName: 'Điểm dừng D'
    },
    {
      id: '6',
      name: 'Đặng Thị Hương',
      grade: '8',
      class: '8B1',
      parentName: 'Đặng Văn Tùng',
      parentPhone: '0906666666',
      stopName: 'Điểm dừng E'
    },
    {
      id: '7',
      name: 'Ngô Văn Đức',
      grade: '9',
      class: '9A1',
      parentName: 'Ngô Thị Hạnh',
      parentPhone: '0907777777',
      stopName: 'Điểm dừng F'
    }
  ]
}

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>(mockRoutes)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [newStop, setNewStop] = useState({ name: '', address: '' })
  const [newRouteStops, setNewRouteStops] = useState<Stop[]>([])
  const [selectedStopForRoute, setSelectedStopForRoute] = useState('')
  const [editRouteStops, setEditRouteStops] = useState<Stop[]>([])
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động'
      case 'inactive': return 'Không hoạt động'
      default: return status
    }
  }

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route)
    setEditRouteStops([...route.stops])
    setShowEditModal(true)
  }

  const handleViewStudents = (route: Route) => {
    setSelectedRoute(route)
    setShowStudentsModal(true)
  }

  const handleAddStop = () => {
    if (selectedRoute && newStop.name && newStop.address) {
      const updatedRoute = {
        ...selectedRoute,
        stops: [...selectedRoute.stops, {
          id: Date.now().toString(),
          ...newStop
        }]
      }
      
      setRoutes(routes.map(r => r.id === selectedRoute.id ? updatedRoute : r))
      setSelectedRoute(updatedRoute)
      setNewStop({ name: '', address: '' })
    }
  }

  const handleAddStopToNewRoute = () => {
    if (selectedStopForRoute) {
      const selectedStop = availableStops.find(stop => stop.id === selectedStopForRoute)
      if (selectedStop && !newRouteStops.find(stop => stop.id === selectedStop.id)) {
        setNewRouteStops([...newRouteStops, selectedStop])
        setSelectedStopForRoute('')
      }
    }
  }

  const handleRemoveStopFromNewRoute = (stopId: string) => {
    setNewRouteStops(newRouteStops.filter(stop => stop.id !== stopId))
  }

  const handleChangeStopInRoute = (index: number, newStopId: string) => {
    const newStop = availableStops.find(stop => stop.id === newStopId)
    if (newStop) {
      const updatedStops = [...editRouteStops]
      updatedStops[index] = newStop
      setEditRouteStops(updatedStops)
      setEditingStopIndex(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tuyến đường</h1>
          <p className="text-gray-600 mt-2">Tạo và chỉnh sửa tuyến đường, thêm điểm dừng, xem danh sách học sinh</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm tuyến đường</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tuyến đường hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoutes.map((route) => (
          <div key={route.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(route.status)}`}>
                  {getStatusText(route.status)}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditRoute(route)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Route Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{route.stops.length}</p>
                <p className="text-xs text-gray-600">Điểm dừng</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{route.studentCount}</p>
                <p className="text-xs text-gray-600">Học sinh</p>
              </div>
            </div>

            {/* Stops Preview */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Điểm dừng</h4>
              <div className="space-y-2">
                {route.stops.slice(0, 2).map((stop, index) => (
                  <div key={stop.id} className="flex items-center space-x-2 text-sm">
                    <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{stop.name}</span>

                  </div>
                ))}
                {route.stops.length > 2 && (
                  <p className="text-sm text-gray-500">+{route.stops.length - 2} điểm dừng khác</p>
                )}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => handleViewStudents(route)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Xem học sinh ({route.studentCount})</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm tuyến đường mới</h3>
            <form className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tuyến đường
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tuyến 1"
                />
              </div>

              {/* Stops Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Chọn điểm dừng</h4>
                
                {/* Current Selected Stops */}
                {newRouteStops.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Điểm dừng đã chọn ({newRouteStops.length}):</p>
                    <div className="space-y-2">
                      {newRouteStops.map((stop, index) => (
                        <div key={stop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{stop.name}</p>
                              <p className="text-sm text-gray-600">{stop.address}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStopFromNewRoute(stop.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Stop from Available List */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn điểm dừng có sẵn
                      </label>
                      <select
                        value={selectedStopForRoute}
                        onChange={(e) => setSelectedStopForRoute(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">-- Chọn điểm dừng --</option>
                        {availableStops
                          .filter(stop => !newRouteStops.find(selected => selected.id === stop.id))
                          .map(stop => (
                            <option key={stop.id} value={stop.id}>
                              {stop.name} - {stop.address}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStopToNewRoute}
                      disabled={!selectedStopForRoute}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm điểm dừng</span>
                    </button>
                  </div>
                  
                  {availableStops.filter(stop => !newRouteStops.find(selected => selected.id === stop.id)).length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">Đã chọn tất cả điểm dừng có sẵn</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewRouteStops([])
                    setSelectedStopForRoute('')
                  }}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={newRouteStops.length === 0}
                >
                  Thêm tuyến đường
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Route Modal */}
      {showEditModal && editingRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Chỉnh sửa tuyến đường - {editingRoute.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form className="space-y-6">
              {/* Route Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tuyến đường
                </label>
                <input
                  type="text"
                  defaultValue={editingRoute.name}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tuyến 1"
                />
              </div>

              {/* Current Stops */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thứ tự điểm dừng hiện tại</h4>
                {editRouteStops.length > 0 ? (
                  <div className="space-y-3">
                    {editRouteStops.map((stop, index) => (
                      <div key={`${stop.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{stop.name}</p>
                              <p className="text-sm text-gray-600">{stop.address}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingStopIndex(editingStopIndex === index ? null : index)}
                            className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="text-sm">Thay đổi</span>
                          </button>
                        </div>
                        
                        {editingStopIndex === index && (
                          <div className="border-t border-gray-200 pt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chọn điểm dừng khác cho vị trí thứ {index + 1}
                            </label>
                            <div className="flex items-center space-x-3">
                              <select
                                onChange={(e) => handleChangeStopInRoute(index, e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                defaultValue=""
                              >
                                <option value="">-- Chọn điểm dừng mới --</option>
                                {availableStops.map(availableStop => (
                                  <option key={availableStop.id} value={availableStop.id}>
                                    {availableStop.name} - {availableStop.address}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setEditingStopIndex(null)}
                                className="btn-secondary text-sm"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có điểm dừng nào</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingRoute(null)
                    setEditRouteStops([])
                    setEditingStopIndex(null)
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

      {/* Students List Modal */}
      {showStudentsModal && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách học sinh - {selectedRoute.name}
              </h3>
              <button
                onClick={() => setShowStudentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>



            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học sinh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phụ huynh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm dừng
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockStudentsByRoute[selectedRoute.id]?.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">Khối {student.grade}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.class}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.parentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.parentPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {student.stopName}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Không có học sinh nào trong tuyến đường này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>



            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowStudentsModal(false)}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}