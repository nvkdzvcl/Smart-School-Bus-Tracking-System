import { useMemo, useState } from 'react'
import { Plus, Edit, Trash2, Search, User, ChevronLeft, ChevronRight } from 'lucide-react'

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
  { id: '1', name: 'Nguyễn Minh An', class: '6A1', parentName: 'Nguyễn Văn Bình', parentPhone: '0901111111', routeId: '1', routeName: 'Tuyến 1', stopName: 'Điểm dừng A', status: 'active' },
  { id: '2', name: 'Trần Thị Bảo', class: '7B2', parentName: 'Trần Văn Cường', parentPhone: '0902222222', routeId: '2', routeName: 'Tuyến 2', stopName: 'Điểm dừng B', status: 'active' },
  { id: '3', name: 'Lê Hoàng Dũng', class: '8C1', parentName: 'Lê Thị Hoa', parentPhone: '0903333333', status: 'inactive' },
]

const mockRoutes = [
  { id: '1', name: 'Tuyến 1', stops: ['Điểm dừng A', 'Điểm dừng B', 'Điểm dừng C'] },
  { id: '2', name: 'Tuyến 2', stops: ['Điểm dừng D', 'Điểm dừng E', 'Điểm dừng F'] },
  { id: '3', name: 'Tuyến 3', stops: ['Điểm dừng G', 'Điểm dừng H', 'Điểm dừng I'] }
]

// ───────────────────────────────── helpers ─────────────────────────────────
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
// Lấy khối từ chuỗi lớp, ví dụ "6A1" -> 6
const getGradeFromClass = (cls: string): number | null => {
  const m = cls.match(/^(\d{1,2})/); return m ? Number(m[1]) : null
}

// ─────────────────────────────── component ────────────────────────────────
export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [searchTerm, setSearchTerm] = useState('')

  // filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')   // Khối
  const [classFilter, setClassFilter] = useState<string>('all')   // Lớp
  const [routeFilter, setRouteFilter] = useState<string>('all')   // Tuyến

  // modal states (giữ nguyên)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState('')
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editSelectedRoute, setEditSelectedRoute] = useState('')

  // pagination
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Các options động cho bộ lọc
  const gradeOptions = useMemo(() => {
    const s = new Set<number>()
    students.forEach(st => { const g = getGradeFromClass(st.class); if (g) s.add(g) })
    return Array.from(s).sort((a,b) => a-b)
  }, [students])

  const classOptions = useMemo(() => {
    if (gradeFilter === 'all') return []
    const s = new Set<string>()
    students.forEach(st => {
      const g = getGradeFromClass(st.class)
      if (String(g) === gradeFilter) s.add(st.class)
    })
    return Array.from(s).sort()
  }, [students, gradeFilter])

  // filter + search
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return students.filter(student => {
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.parentName.toLowerCase().includes(term) ||
        student.class.toLowerCase().includes(term) ||
        student.parentPhone.includes(term)

      const matchesStatus = statusFilter === 'all' || student.status === statusFilter
      const grade = getGradeFromClass(student.class)
      const matchesGrade = gradeFilter === 'all' || String(grade) === gradeFilter
      const matchesClass = classFilter === 'all' || student.class === classFilter
      const matchesRoute = routeFilter === 'all' || student.routeId === routeFilter

      return matchesSearch && matchesStatus && matchesGrade && matchesClass && matchesRoute
    })
  }, [students, searchTerm, statusFilter, gradeFilter, classFilter, routeFilter])

  // phân trang
  const maxPage = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page])

  // reset page khi thay đổi filter/search
  const resetToFirst = () => setPage(1)

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditSelectedRoute(student.routeId || '')
    setShowEditModal(true)
  }
  const handleDeleteStudent = (id: string) => {
    if (confirm('Xóa học sinh này?')) {
      setStudents(prev => prev.filter(s => s.id !== id))
      resetToFirst()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Học sinh</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin học sinh, phụ huynh và phân công tuyến đường</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Thêm học sinh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo tên HS, phụ huynh, lớp, SĐT…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetToFirst() }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={gradeFilter}
            onChange={(e) => { setGradeFilter(e.target.value); setClassFilter('all'); resetToFirst() }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tất cả khối</option>
            {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); resetToFirst() }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
            disabled={gradeFilter === 'all'}
          >
            <option value="all">Tất cả lớp</option>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetToFirst() }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="inactive">Không hoạt động</option>
          </select>

          <select
            value={routeFilter}
            onChange={(e) => { setRouteFilter(e.target.value); resetToFirst() }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tất cả tuyến</option>
            {mockRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE + pagination */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              <th className="px-3 py-2 font-medium">Họ và tên</th>
              <th className="px-3 py-2 font-medium">Lớp</th>
              <th className="px-3 py-2 font-medium">Trạng thái</th>
              <th className="px-3 py-2 font-medium">Tên phụ huynh</th>
              <th className="px-3 py-2 font-medium">SĐT</th>
              <th className="px-3 py-2 font-medium">Tuyến</th>
              <th className="px-3 py-2 font-medium">Điểm dừng</th>
              <th className="px-3 py-2 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-500">Không có dữ liệu phù hợp.</td>
              </tr>
            )}
            {paginated.map((student, i) => (
              <tr key={student.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full grid place-items-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2">{student.class}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                    {getStatusText(student.status)}
                  </span>
                </td>
                <td className="px-3 py-2">{student.parentName}</td>
                <td className="px-3 py-2">{student.parentPhone}</td>
                <td className="px-3 py-2">{student.routeName ?? '—'}</td>
                <td className="px-3 py-2">{student.stopName ?? '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEditStudent(student)} className="text-primary-600 hover:text-primary-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* footer pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm">
          <div className="text-gray-600">
            Hiển thị <b>{paginated.length}</b> / <b>{filteredStudents.length}</b> học sinh
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </button>
            <span className="text-gray-700">Trang <b>{page}</b> / <b>{maxPage}</b></span>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
            >
              Sau <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal (giữ nguyên logic) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm học sinh mới</h3>
            <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); setShowAddModal(false)}}>
              {/* ... giữ nguyên form như bạn đã viết ... */}
              {/* (Bạn có thể paste block Add Student Modal cũ của bạn vào đây không đổi) */}
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary">Thêm học sinh</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal (giữ nguyên form, chỉ giữ handler đóng) */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa thông tin học sinh</h3>
            <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); setShowEditModal(false)}}>
              {/* ... paste lại block Edit Student Modal của bạn ... */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingStudent(null); setEditSelectedRoute('') }}
                  className="btn-secondary"
                >Hủy</button>
                <button type="submit" className="btn-primary">Cập nhật thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
