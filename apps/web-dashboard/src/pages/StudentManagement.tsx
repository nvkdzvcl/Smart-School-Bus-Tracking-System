import { useMemo, useState, useEffect } from 'react'
import {
  Plus, Edit, Trash2, Search, User, ChevronLeft, ChevronRight,
  Users, UserCheck, UserX, AlertCircle
} from 'lucide-react'

// --- THAY MOCK BẰNG API THẬT ---
// Xóa toàn bộ khối MOCK trước đây, import trực tiếp các hàm từ API service
import {
  getStudents,
  getParents,
  getStops,
  getRoutes,
  createStudent,
  updateStudent,
  deleteStudent,
  Student as ApiStudent
} from '../lib/api'
// --- HẾT ---

interface RouteUI {
  id: string
  name: string
  stopIds: Set<string> // Thêm Set để tìm kiếm nhanh O(1)
}

interface StopUI {
  id: string
  name: string
}

interface ParentUI {
  id: string;
  fullName: string;
  phone: string;
}

interface StudentUI {
  id: string
  fullName: string
  class?: string
  status: 'active' | 'inactive'
  parentId?: string
  parentName?: string
  parentPhone?: string
  routeId?: string
  routeName?: string
  pickupStopId?: string
  pickupStopName?: string
  dropoffStopId?: string
  dropoffStopName?: string
}

export default function StudentManagement() {
  // data state
  const [students, setStudents] = useState<StudentUI[]>([])
  const [parents, setParents] = useState<ParentUI[]>([])
  const [stops, setStops] = useState<StopUI[]>([])
  const [routes, setRoutes] = useState<RouteUI[]>([])

  // ui state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  // modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentUI | null>(null)

  // form add
  const emptyAddForm: Omit<StudentUI, 'id'> = { fullName: '', class: '', status: 'active' }
  const [addForm, setAddForm] = useState<Omit<StudentUI, 'id'>>(emptyAddForm)

  // form edit
  const [editForm, setEditForm] = useState<StudentUI | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // helpers
  const mapStudent = (s: ApiStudent): StudentUI => ({
    id: s.id,
    fullName: s.fullName,
    class: s.class,
    status: s.status,
    parentId: s.parent?.id,
    parentName: s.parent?.fullName,
    parentPhone: s.parent?.phone,
    routeId: s.route?.id,
    routeName: s.route?.name,
    pickupStopId: s.pickupStop?.id,
    pickupStopName: s.pickupStop?.name,
    dropoffStopId: s.dropoffStop?.id,
    dropoffStopName: s.dropoffStop?.name,
  })

  // initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const [stu, par, sps, rts] = await Promise.all([
          getStudents(),
          getParents(),
          getStops(),
          getRoutes()
        ])

        // Xử lý routes để lấy ra danh sách stopIds cho việc tìm kiếm
        const processedRoutes: RouteUI[] = rts.map((r: any) => {
          // Route từ API thường trả về mảng stops, cần lấy ID từ đó
          // Cấu trúc có thể là r.stops = [{ stop: { id: ... } }] hoặc r.stopIds
          const stopList = r.stops || [];
          const ids = stopList.map((s: any) => s.stop?.id || s.id || s);
          return {
            id: r.id,
            name: r.name,
            stopIds: new Set(ids) // Dùng Set để check tồn tại nhanh hơn
          };
        });

        setStudents(stu.map(mapStudent))
        setParents(par)
        setStops(sps)
        setRoutes(processedRoutes)
      } catch (e: any) {
        setError(e.message || 'Không tải được dữ liệu')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  // --- LOGIC MỚI: Tự động xác định tên tuyến dựa vào 2 điểm ---
  const getCalculatedRouteName = (pickupId?: string, dropoffId?: string) => {
    if (!pickupId || !dropoffId) return '—';

    // Tìm tuyến đường chứa cả điểm đón VÀ điểm trả
    const foundRoute = routes.find(r => r.stopIds.has(pickupId) && r.stopIds.has(dropoffId));

    return foundRoute ? foundRoute.name : 'Chưa có tuyến phù hợp';
  }

  // --- Logic tự động cập nhật routeId trong Form (để gửi lên API) ---
  const updateRouteOnChange = (
    form: StudentUI | Omit<StudentUI, 'id'>,
    isAddForm: boolean,
    pickupId: string | undefined,
    dropoffId: string | undefined
  ) => {
    let newRouteId: string | undefined = undefined;
    let newRouteName: string | undefined = undefined;

    if (pickupId && dropoffId) {
      const foundRoute = routes.find(r => r.stopIds.has(pickupId) && r.stopIds.has(dropoffId));
      if (foundRoute) {
        newRouteId = foundRoute.id;
        newRouteName = foundRoute.name;
      }
    }

    const newForm = {
      ...form,
      pickupStopId: pickupId,
      pickupStopName: stops.find(s => s.id === pickupId)?.name,
      dropoffStopId: dropoffId,
      dropoffStopName: stops.find(s => s.id === dropoffId)?.name,
      routeId: newRouteId, // Tự động gán ID tuyến tìm thấy
      routeName: newRouteName
    };

    if (isAddForm) {
      setAddForm(newForm as Omit<StudentUI, 'id'>);
    } else {
      setEditForm(newForm as StudentUI);
    }
  }

  // --- LOGIC AUTO ASSIGN TUYẾN (LOGIC GỐC CỦA BẠN) ---
  useEffect(() => {
    // Index: stopId -> danh sách tuyến (chỉ tuyến đang hoạt động)
    const stopToActiveRoutes = new Map<string, { id: string; name: string }[]>()
    // @ts-ignore routes có thể chứa stops: {id,name,stops?:[{id}], status}
    routes.forEach((r: any) => {
      const isActive = String(r.status || 'active').toLowerCase() === 'active'
      const stopsArr: any[] = r.stops || r.stopIds || []
      // Nếu là Set thì chuyển về array để loop
      const stopIds = r.stopIds instanceof Set ? Array.from(r.stopIds) : stopsArr

      if (!isActive) return
      stopIds.forEach((sid: any) => {
        // sid có thể là string ID do logic map ở trên
        if (!sid) return
        const list = stopToActiveRoutes.get(sid) || []
        list.push({ id: r.id, name: r.name })
        stopToActiveRoutes.set(sid, list)
      })
    })

    const pickRoute = (pickupId?: string, dropoffId?: string) => {
      if (!pickupId || !dropoffId) return { id: undefined as string | undefined, name: undefined as string | undefined }
      const routesPick = stopToActiveRoutes.get(pickupId) || []
      const routesDrop = stopToActiveRoutes.get(dropoffId) || []
      const intersect = routesPick.filter(rp => routesDrop.some(rd => rd.id === rp.id))
      const chosen = intersect[0]
      return { id: chosen?.id, name: chosen?.name }
    }

    // Add form: auto assign tuyến
    if (addForm.pickupStopId || addForm.dropoffStopId) {
      const chosen = pickRoute(addForm.pickupStopId, addForm.dropoffStopId)
      setAddForm(f => ({ ...f, routeId: chosen.id, routeName: chosen.name || (f.pickupStopId && f.dropoffStopId ? 'Chưa có tuyến phù hợp' : undefined) }))
    }

    // Edit form: auto assign tuyến nếu đang chọn điểm đón/trả, hoặc nếu tuyến hiện tại bị inactive
    if (editForm) {
      const chosen = pickRoute(editForm.pickupStopId, editForm.dropoffStopId)
      const currentRoute = routes.find(r => r.id === editForm.routeId)
      // @ts-ignore status
      const currentInactive = currentRoute && String(currentRoute.status || 'active').toLowerCase() === 'inactive'
      if (chosen.id || currentInactive) {
        setEditForm(f => f ? ({ ...f, routeId: chosen.id, routeName: chosen.name || (f.pickupStopId && f.dropoffStopId ? 'Chưa có tuyến phù hợp' : undefined) }) : f)
      }
    }
  }, [routes, addForm.pickupStopId, addForm.dropoffStopId, editForm?.pickupStopId, editForm?.dropoffStopId, editForm?.routeId])

  // derived options
  const gradeOptions = useMemo(() => {
    const s = new Set<number>()
    students.forEach(st => { const m = st.class?.match(/^(\d{1,2})/); if (m) s.add(Number(m[1])) })
    return Array.from(s).sort((a, b) => a - b)
  }, [students])

  const classOptions = useMemo(() => {
    if (gradeFilter === 'all') return []
    const s = new Set<string>()
    students.forEach(st => { const g = st.class?.match(/^(\d{1,2})/)?.[1]; if (g && g === gradeFilter) s.add(st.class!) })
    return Array.from(s).sort()
  }, [students, gradeFilter])

  // filtering
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return students.filter(st => {
      const matchesSearch = !term ||
        st.fullName.toLowerCase().includes(term) ||
        (st.parentName || '').toLowerCase().includes(term) ||
        (st.class || '').toLowerCase().includes(term) ||
        (st.parentPhone || '').includes(term)
      const matchesStatus = statusFilter === 'all' || st.status === statusFilter
      const grade = st.class?.match(/^(\d{1,2})/)?.[1]
      const matchesGrade = gradeFilter === 'all' || grade === gradeFilter
      const matchesClass = classFilter === 'all' || st.class === classFilter
      return matchesSearch && matchesStatus && matchesGrade && matchesClass
    })
  }, [students, searchTerm, statusFilter, gradeFilter, classFilter])

  // --- STATS CALCULATION (NEW) ---
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter(s => s.status === 'active').length,
      inactive: students.filter(s => s.status === 'inactive').length,
      noRoute: students.filter(s => !s.routeId && s.status === 'active').length
    }
  }, [students])

  const maxPage = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page])

  const resetPage = () => setPage(1)

  // actions
  const openAdd = () => { setAddForm(emptyAddForm); setShowAddModal(true) }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.fullName) return alert('Họ và tên bắt buộc')
    setActionLoading(true)
    try {
      const created = await createStudent({
        fullName: addForm.fullName,
        class: addForm.class || undefined,
        status: addForm.status,
        parentId: addForm.parentId,
        routeId: addForm.routeId, // ID này đã được tính toán ở updateRouteOnChange
        pickupStopId: addForm.pickupStopId,
        dropoffStopId: addForm.dropoffStopId,
      })
      setStudents(prev => [...prev, mapStudent(created)])
      setShowAddModal(false); resetPage()
    } catch (e: any) { alert(e.message || 'Thêm học sinh thất bại') }
    finally { setActionLoading(false) }
  }

  const handleEditStudent = (st: StudentUI) => { setEditingStudent(st); setEditForm({ ...st }); setShowEditModal(true) }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editForm) return
    setActionLoading(true)
    try {
      const updated = await updateStudent(editForm.id, {
        fullName: editForm.fullName,
        class: editForm.class,
        status: editForm.status,
        parentId: editForm.parentId,
        routeId: editForm.routeId, // ID này đã được tính toán ở updateRouteOnChange
        pickupStopId: editForm.pickupStopId,
        dropoffStopId: editForm.dropoffStopId,
      })
      setStudents(prev => prev.map(s => s.id === editForm.id ? mapStudent(updated) : s))
      setShowEditModal(false); setEditingStudent(null); setEditForm(null)
    } catch (e: any) { alert(e.message || 'Cập nhật thất bại') }
    finally { setActionLoading(false) }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Xóa học sinh này?')) return
    try { await deleteStudent(id); setStudents(prev => prev.filter(s => s.id !== id)); resetPage() } catch (e: any) { alert(e.message || 'Xóa thất bại') }
  }

  // status badge helpers
  const getStatusColor = (status: string) => status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  const getStatusText = (status: string) => status === 'active' ? 'Đang học' : 'Tạm nghỉ'

  return (
    <div className="space-y-6">
      {/* 1. HEADER TITLE */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Học sinh</h1>
          <p className="text-gray-600 text-sm mt-1">Quản lý hồ sơ học sinh, phụ huynh và phân công tuyến đường</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Thêm học sinh</span>
        </button>
      </div>

      {/* 2. STAT CARDS (Mới - Đồng bộ với Driver) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng học sinh</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Đang học</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <UserX className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tạm nghỉ</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Chưa có tuyến</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.noRoute}</p>
          </div>
        </div>
      </div>

      {/* 3. FILTER BAR (Tách riêng giống Driver) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); resetPage() }}
              placeholder="Tìm theo tên HS, phụ huynh, lớp, SĐT…"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setClassFilter('all'); resetPage() }} className="w-[140px] shrink-0 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">Tất cả khối</option>
            {gradeOptions.map(g => <option key={g} value={g}>Khối {g}</option>)}
          </select>
          <select value={classFilter} disabled={gradeFilter === 'all'} onChange={e => { setClassFilter(e.target.value); resetPage() }} className="w-[140px] shrink-0 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400">
            <option value="all">Tất cả lớp</option>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); resetPage() }} className="w-[160px] shrink-0 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="inactive">Tạm nghỉ</option>
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* 4. MAIN TABLE (Zebra Styled) */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Danh sách học sinh ({filteredStudents.length})</h2>
        </div>

        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              <th className="px-4 py-3 font-medium text-center">Học sinh</th>
              <th className="px-4 py-3 font-medium text-center">Lớp</th>
              <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-center">Phụ huynh</th>
              <th className="px-4 py-3 font-medium text-center">Tuyến xe</th>
              <th className="px-4 py-3 font-medium text-center">Đón / Trả</th>
              <th className="px-4 py-3 font-medium text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="py-8 text-center text-gray-500">Đang tải...</td></tr>}
            {!loading && paginated.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-500">Không có dữ liệu phù hợp.</td></tr>}
            {!loading && paginated.map((st, i) => (
              <tr key={st.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                {/* 1. Học sinh */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{st.fullName}</div>
                      <div className="text-xs text-gray-500">#{st.id}</div>
                    </div>
                  </div>
                </td>

                {/* 2. Lớp */}
                <td className="px-4 py-3 text-center font-medium text-gray-700">{st.class || '—'}</td>

                {/* 3. Trạng thái */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(st.status)}`}>{getStatusText(st.status)}</span>
                </td>

                {/* 4. Phụ huynh */}
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-900 font-medium">{st.parentName || '—'}</span>
                    <span className="text-xs text-gray-500">{st.parentPhone}</span>
                  </div>
                </td>

                {/* 5. Tuyến */}
                <td className="px-4 py-3 text-center font-medium text-blue-600">
                  {getCalculatedRouteName(st.pickupStopId, st.dropoffStopId)}
                </td>

                {/* 6. Điểm đón/trả */}
                <td className="px-4 py-3 text-center text-xs">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-gray-600" title={st.pickupStopName}>Đón: <b className="text-gray-900">{st.pickupStopName || '—'}</b></span>
                    <span className="text-gray-600" title={st.dropoffStopName}>Trả: <b className="text-gray-900">{st.dropoffStopName || '—'}</b></span>
                  </div>
                </td>

                {/* 7. Hành động */}
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleEditStudent(st)} className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteStudent(st.id)} className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm">
          <div className="text-gray-600">Hiển thị <b>{paginated.length}</b> / <b>{filteredStudents.length}</b> học sinh</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /> Trước</button>
            <span className="text-gray-700">Trang <b>{page}</b> / <b>{maxPage}</b></span>
            <button onClick={() => setPage(p => Math.min(maxPage, p + 1))} disabled={page >= maxPage} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50">Sau <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Thêm học sinh mới</h3>
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Thông tin học sinh</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="grid gap-1 text-sm"><span>Họ và tên <span className="text-red-500">*</span></span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={addForm.fullName} onChange={e => setAddForm(f => ({ ...f, fullName: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Lớp</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={addForm.class || ''} onChange={e => setAddForm(f => ({ ...f, class: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Trạng thái</span><select className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value as StudentUI['status'] }))}><option value="active">Đang học</option><option value="inactive">Tạm nghỉ</option></select></label>
                </div>
              </section>
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Phụ huynh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Chọn phụ huynh</span><select className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={addForm.parentId || ''} onChange={e => { const p = parents.find(x => x.id === e.target.value); setAddForm(f => ({ ...f, parentId: e.target.value || undefined, parentName: p?.fullName, parentPhone: p?.phone })) }}><option value="">— Chưa chọn —</option>{parents.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></label>
                  <div className="grid gap-1 text-sm"><span>SĐT phụ huynh</span><input disabled className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-gray-500" value={addForm.parentPhone || ''} /></div>
                </div>
              </section>
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Điểm dừng và Tuyến đường</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="grid gap-1 text-sm"><span>Điểm đón</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={addForm.pickupStopId || ''}
                      onChange={e => {
                        const id = e.target.value || undefined;
                        updateRouteOnChange(addForm, true, id, addForm.dropoffStopId);
                      }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm"><span>Điểm trả</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={addForm.dropoffStopId || ''}
                      onChange={e => {
                        const id = e.target.value || undefined;
                        updateRouteOnChange(addForm, true, addForm.pickupStopId, id);
                      }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm"><span>Tuyến đường (Tự động)</span>
                    <input
                      disabled
                      className="h-9 rounded-lg border border-gray-200 bg-blue-50 px-3 w-full text-blue-700 font-medium"
                      value={addForm.routeName || 'Chưa xác định'}
                    />
                  </label>
                </div>
              </section>
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Ghi đè tuyến (Tùy chọn)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Chọn tuyến thủ công</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={addForm.routeId || ''} onChange={e => { const r = routes.find(x => x.id === e.target.value); setAddForm(f => ({ ...f, routeId: e.target.value || undefined, routeName: r?.name })) }}>
                      <option value="">— (Mặc định theo điểm đón/trả) —</option>
                      {routes.filter(r => String((r as any).status || 'active').toLowerCase() === 'active').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </label>
                  {addForm.pickupStopId && addForm.dropoffStopId && !addForm.routeId && (
                    <p className="text-xs text-red-600 flex items-center">Chưa có tuyến phù hợp với điểm đón/trả đã chọn.</p>
                  )}
                </div>
              </section>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4"><button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Hủy</button><button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-md" disabled={actionLoading}>Thêm học sinh</button></div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingStudent && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Chỉnh sửa thông tin học sinh</h3>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Thông tin học sinh</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="grid gap-1 text-sm"><span>Họ và tên</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f!, fullName: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Lớp</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={editForm.class || ''} onChange={e => setEditForm(f => ({ ...f!, class: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Trạng thái</span><select className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={editForm.status} onChange={e => setEditForm(f => ({ ...f!, status: e.target.value as StudentUI['status'] }))}><option value="active">Đang học</option><option value="inactive">Tạm nghỉ</option></select></label>
                </div>
              </section>
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Phụ huynh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Chọn phụ huynh</span><select className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={editForm.parentId || ''} onChange={e => { const p = parents.find(x => x.id === e.target.value); setEditForm(f => ({ ...f!, parentId: e.target.value || undefined, parentName: p?.fullName, parentPhone: p?.phone })) }}><option value="">— Chưa chọn —</option>{parents.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></label>
                  <div className="grid gap-1 text-sm"><span>SĐT phụ huynh</span><input disabled className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-gray-500" value={editForm.parentPhone || ''} /></div>
                </div>
              </section>
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Điểm dừng và Tuyến đường</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="grid gap-1 text-sm"><span>Điểm đón</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={editForm.pickupStopId || ''}
                      onChange={e => {
                        const id = e.target.value || undefined;
                        updateRouteOnChange(editForm!, false, id, editForm!.dropoffStopId);
                      }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm"><span>Điểm trả</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={editForm.dropoffStopId || ''}
                      onChange={e => {
                        const id = e.target.value || undefined;
                        updateRouteOnChange(editForm!, false, editForm!.pickupStopId, id);
                      }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm"><span>Tuyến đường (Tự động)</span>
                    <input
                      disabled
                      className="h-9 rounded-lg border border-gray-200 bg-blue-50 px-3 w-full text-blue-700 font-medium"
                      value={editForm.routeName || 'Chưa xác định'}
                    />
                  </label>
                </div>
              </section>
              <section>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Ghi đè tuyến (Tùy chọn)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Chọn tuyến thủ công</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={editForm.routeId || ''} onChange={e => { const r = routes.find(x => x.id === e.target.value); setEditForm(f => ({ ...f!, routeId: e.target.value || undefined, routeName: r?.name })) }}>
                      <option value="">— (Mặc định theo điểm đón/trả) —</option>
                      {routes.filter(r => String((r as any).status || 'active').toLowerCase() === 'active').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </label>
                  {editForm.pickupStopId && editForm.dropoffStopId && !editForm.routeId && (
                    <p className="text-xs text-red-600 flex items-center">Chưa có tuyến phù hợp với điểm đón/trả đã chọn.</p>
                  )}
                </div>
              </section>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-4"><button type="button" onClick={() => { setShowEditModal(false); setEditingStudent(null); setEditForm(null) }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Hủy</button><button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-md" disabled={actionLoading}>Cập nhật thông tin</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}