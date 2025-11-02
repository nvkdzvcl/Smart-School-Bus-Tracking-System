import { useState } from 'react'
import { Plus, Edit, Trash2, Search, User } from 'lucide-react'

interface Student {
  id: string
  name: string
  class: string
  parentName: string
  parentPhone: string
  routeId?: string
  routeName?: string
  stopName?: string
  status: 'active' | 'inactive'
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Nguyễn Minh An',
    class: '6A1',
    parentName: 'Nguyễn Văn Bình',
    parentPhone: '0901111111',
    routeId: '1',
    routeName: 'Tuyến 1',
    stopName: 'Điểm dừng A',
    status: 'active'
  },
  {
    id: '2',
    name: 'Trần Thị Bảo',
    class: '7B2',
    parentName: 'Trần Văn Cường',
    parentPhone: '0902222222',
    routeId: '2',
    routeName: 'Tuyến 2',
    stopName: 'Điểm dừng B',
    status: 'active'
  },
  {
    id: '3',
    name: 'Lê Hoàng Dũng',
    class: '8C1',
    parentName: 'Lê Thị Hoa',
    parentPhone: '0903333333',
    status: 'inactive'
  }
]

const mockRoutes = [
  { id: '1', name: 'Tuyến 1', stops: ['Điểm dừng A', 'Điểm dừng B', 'Điểm dừng C'] },
  { id: '2', name: 'Tuyến 2', stops: ['Điểm dừng D', 'Điểm dừng E', 'Điểm dừng F'] },
  { id: '3', name: 'Tuyến 3', stops: ['Điểm dừng G', 'Điểm dừng H', 'Điểm dừng I'] }
]

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [searchTerm, setSearchTerm] = useState('')

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState('')
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editSelectedRoute, setEditSelectedRoute] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang học'
      case 'inactive': return 'Không hoạt động'
      default: return status
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditSelectedRoute(student.routeId || '')
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Học sinh</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin học sinh, phụ huynh và phân công tuyến đường</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học sinh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên học sinh, phụ huynh hoặc lớp..."
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
            <option value="active">Đang học</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">Lớp {student.class}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                    {getStatusText(student.status)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditStudent(student)}
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
              {/* Parent Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin phụ huynh</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><span className="font-medium">Tên:</span> {student.parentName}</div>
                  <div><span className="font-medium">SĐT:</span> {student.parentPhone}</div>
                </div>
              </div>



              {/* Route Info */}
              {student.routeName && student.stopName ? (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-2">Thông tin tuyến đường</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div><span className="font-medium">Tuyến:</span> {student.routeName}</div>
                    <div><span className="font-medium">Điểm dừng:</span> {student.stopName}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">Chưa được phân công tuyến đường</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm học sinh mới</h3>
            <form className="space-y-6">
              {/* Student Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin học sinh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nguyễn Minh An"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lớp
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="6A1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="active">Đang học</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin phụ huynh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên phụ huynh
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nguyễn Văn Bình"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0901111111"
                    />
                  </div>


                </div>
              </div>

              {/* Route Assignment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Phân công tuyến đường</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuyến đường
                    </label>
                    <select 
                      value={selectedRoute}
                      onChange={(e) => setSelectedRoute(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn tuyến đường</option>
                      {mockRoutes.map(route => (
                        <option key={route.id} value={route.id}>{route.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điểm dừng
                    </label>
                    <select 
                      disabled={!selectedRoute}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Chọn điểm dừng</option>
                      {selectedRoute && mockRoutes.find(r => r.id === selectedRoute)?.stops.map(stop => (
                        <option key={stop} value={stop}>{stop}</option>
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
                  Thêm học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa thông tin học sinh</h3>
            <form className="space-y-6">
              {/* Student Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin học sinh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      defaultValue={editingStudent.name}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nguyễn Minh An"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lớp
                    </label>
                    <input
                      type="text"
                      defaultValue={editingStudent.class}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="6A1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select 
                      defaultValue={editingStudent.status}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="active">Đang học</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin phụ huynh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên phụ huynh
                    </label>
                    <input
                      type="text"
                      defaultValue={editingStudent.parentName}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nguyễn Văn Bình"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      defaultValue={editingStudent.parentPhone}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0901111111"
                    />
                  </div>


                </div>
              </div>

              {/* Route Assignment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Phân công tuyến đường</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuyến đường hiện tại
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">
                        {editingStudent.routeName || 'Chưa được phân công'}
                      </p>
                      {editingStudent.stopName && (
                        <p className="text-xs text-gray-600 mt-1">
                          Điểm dừng: {editingStudent.stopName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thay đổi tuyến đường
                    </label>
                    <select 
                      value={editSelectedRoute}
                      onChange={(e) => setEditSelectedRoute(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn tuyến đường mới</option>
                      {mockRoutes.map(route => (
                        <option key={route.id} value={route.id}>{route.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điểm dừng
                    </label>
                    <select 
                      disabled={!editSelectedRoute}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {editSelectedRoute ? 'Chọn điểm dừng' : 'Vui lòng chọn tuyến đường trước'}
                      </option>
                      {editSelectedRoute && mockRoutes.find(r => r.id === editSelectedRoute)?.stops.map(stop => (
                        <option key={stop} value={stop}>{stop}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Route Change Warning */}
                {editSelectedRoute && editSelectedRoute !== editingStudent.routeId && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                      <div>
                        <h5 className="text-sm font-medium text-yellow-800">Thay đổi tuyến đường</h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          Bạn đang thay đổi tuyến đường từ "{editingStudent.routeName || 'Chưa có'}" 
                          sang "{mockRoutes.find(r => r.id === editSelectedRoute)?.name}". 
                          Điều này sẽ ảnh hưởng đến lịch trình đưa đón của học sinh.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingStudent(null)
                    setEditSelectedRoute('')
                  }}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Cập nhật thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}