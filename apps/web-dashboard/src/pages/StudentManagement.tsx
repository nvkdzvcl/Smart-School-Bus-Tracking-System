import { useMemo, useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { getStudents, getParents, getStops, createStudent, updateStudent, deleteStudent, Student as ApiStudent } from '../lib/api'

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
  const [parents, setParents] = useState<{ id: string; fullName: string; phone: string }[]>([])
  const [stops, setStops] = useState<{ id: string; name: string }[]>([])

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

  // form edit (controlled separately)
  const [editForm, setEditForm] = useState<StudentUI | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const [stu, par, sps] = await Promise.all([
          getStudents(),
          getParents(),
          getStops()
        ])
        setStudents(stu.map(mapStudent))
        setParents(par)
        setStops(sps)
      } catch (e: any) {
        setError(e.message || 'Không tải được dữ liệu')
      } finally { setLoading(false) }
    }
    load()
  }, [])

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
    try {
      const created = await createStudent({
        fullName: addForm.fullName,
        class: addForm.class || undefined,
        status: addForm.status,
        parentId: addForm.parentId,
        routeId: addForm.routeId,
        pickupStopId: addForm.pickupStopId,
        dropoffStopId: addForm.dropoffStopId,
      })
      setStudents(prev => [...prev, mapStudent(created)])
      setShowAddModal(false); resetPage()
    } catch (e: any) { alert(e.message || 'Thêm học sinh thất bại') }
  }

  const handleEditStudent = (st: StudentUI) => { setEditingStudent(st); setEditForm(st); setShowEditModal(true) }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editForm) return
    try {
      const updated = await updateStudent(editForm.id, {
        fullName: editForm.fullName,
        class: editForm.class,
        status: editForm.status,
        parentId: editForm.parentId,
        routeId: editForm.routeId,
        pickupStopId: editForm.pickupStopId,
        dropoffStopId: editForm.dropoffStopId,
      })
      setStudents(prev => prev.map(s => s.id === editForm.id ? mapStudent(updated) : s))
      setShowEditModal(false); setEditingStudent(null); setEditForm(null)
    } catch (e: any) { alert(e.message || 'Cập nhật thất bại') }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Xóa học sinh này?')) return
    try { await deleteStudent(id); setStudents(prev => prev.filter(s => s.id !== id)); resetPage() } catch (e: any) { alert(e.message || 'Xóa thất bại') }
  }

  // status badge helpers
  const getStatusColor = (status: string) => status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  const getStatusText = (status: string) => status === 'active' ? 'Đang học' : 'Không hoạt động'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Học sinh</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin học sinh, phụ huynh và phân công tuyến đường</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Thêm học sinh</span></button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); resetPage() }}
              placeholder="Tìm theo tên HS, phụ huynh, lớp, SĐT…"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setClassFilter('all'); resetPage() }} className="w-[160px] shrink-0 border border-gray-300 rounded-lg px-3 py-2" aria-label="Lọc theo khối">
            <option value="all">Tất cả khối</option>
            {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={classFilter} disabled={gradeFilter === 'all'} onChange={e => { setClassFilter(e.target.value); resetPage() }} className="w-[160px] shrink-0 border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100" aria-label="Lọc theo lớp">
            <option value="all">Tất cả lớp</option>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); resetPage() }} className="w-[180px] shrink-0 border border-gray-300 rounded-lg px-3 py-2" aria-label="Lọc theo trạng thái">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

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
              <th className="px-3 py-2 font-medium">Đón</th>
              <th className="px-3 py-2 font-medium">Trả</th>
              <th className="px-3 py-2 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="py-8 text-center text-gray-500">Đang tải...</td></tr>}
            {!loading && paginated.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-500">Không có dữ liệu phù hợp.</td></tr>}
            {!loading && paginated.map((st, i) => (
              <tr key={st.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-primary-100 rounded-full grid place-items-center"><User className="w-4 h-4 text-primary-600" /></div><span className="font-medium text-gray-900">{st.fullName}</span></div></td>
                <td className="px-3 py-2">{st.class || '—'}</td>
                <td className="px-3 py-2"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(st.status)}`}>{getStatusText(st.status)}</span></td>
                <td className="px-3 py-2">{st.parentName || '—'}</td>
                <td className="px-3 py-2">{st.parentPhone || '—'}</td>
                <td className="px-3 py-2">{st.routeName || '—'}</td>
                <td className="px-3 py-2">{st.pickupStopName || '—'}</td>
                <td className="px-3 py-2">{st.dropoffStopName || '—'}</td>
                <td className="px-3 py-2"><div className="flex justify-end gap-2"><button onClick={() => handleEditStudent(st)} className="text-primary-600 hover:text-primary-900" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteStudent(st.id)} className="text-red-600 hover:text-red-900" title="Xóa"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm">
          <div className="text-gray-600">Hiển thị <b>{paginated.length}</b> / <b>{filteredStudents.length}</b> học sinh</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Trước</button>
            <span className="text-gray-700">Trang <b>{page}</b> / <b>{maxPage}</b></span>
            <button onClick={() => setPage(p => Math.min(maxPage, p + 1))} disabled={page >= maxPage} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50">Sau <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm học sinh mới</h3>
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <section>
                <h4 className="font-medium mb-3">Thông tin học sinh</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="grid gap-1 text-sm"><span>Họ và tên</span><input className="h-9 rounded-lg border border-gray-300 px-3" value={addForm.fullName} onChange={e => setAddForm(f => ({ ...f, fullName: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Lớp</span><input className="h-9 rounded-lg border border-gray-300 px-3" value={addForm.class || ''} onChange={e => setAddForm(f => ({ ...f, class: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Trạng thái</span><select className="h-9 rounded-lg border border-gray-300 px-3" value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value as StudentUI['status'] }))}><option value="active">Đang học</option><option value="inactive">Không hoạt động</option></select></label>
                </div>
              </section>
              <section>
                <h4 className="font-medium mb-3">Phụ huynh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Chọn phụ huynh</span><select className="h-9 rounded-lg border border-gray-300 px-3" value={addForm.parentId || ''} onChange={e => { const p = parents.find(x => x.id === e.target.value); setAddForm(f => ({ ...f, parentId: e.target.value || undefined, parentName: p?.fullName, parentPhone: p?.phone })) }}><option value="">— Chưa chọn —</option>{parents.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></label>
                  <div className="grid gap-1 text-sm"><span>SĐT phụ huynh</span><input disabled className="h-9 rounded-lg border border-gray-200 bg-gray-100 px-3" value={addForm.parentPhone || ''} /></div>
                </div>
              </section>
              <section>
                <h4 className="font-medium mb-3">Điểm dừng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Điểm đón</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full" value={addForm.pickupStopId || ''} onChange={e => { const sp = stops.find(x => x.id === e.target.value); setAddForm(f => ({ ...f, pickupStopId: e.target.value || undefined, pickupStopName: sp?.name })) }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm"><span>Điểm trả</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full" value={addForm.dropoffStopId || ''} onChange={e => { const sp = stops.find(x => x.id === e.target.value); setAddForm(f => ({ ...f, dropoffStopId: e.target.value || undefined, dropoffStopName: sp?.name })) }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                </div>
              </section>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">Thêm học sinh</button></div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingStudent && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa thông tin học sinh</h3>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <section>
                <h4 className="font-medium mb-3">Thông tin học sinh</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="grid gap-1 text-sm"><span>Họ và tên</span><input className="h-9 rounded-lg border border-gray-300 px-3" value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f!, fullName: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Lớp</span><input className="h-9 rounded-lg border border-gray-300 px-3" value={editForm.class || ''} onChange={e => setEditForm(f => ({ ...f!, class: e.target.value }))} /></label>
                  <label className="grid gap-1 text-sm"><span>Trạng thái</span><select className="h-9 rounded-lg border border-gray-300 px-3" value={editForm.status} onChange={e => setEditForm(f => ({ ...f!, status: e.target.value as StudentUI['status'] }))}><option value="active">Đang học</option><option value="inactive">Không hoạt động</option></select></label>
                </div>
              </section>
              <section>
                <h4 className="font-medium mb-3">Phụ huynh</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Chọn phụ huynh</span><select className="h-9 rounded-lg border border-gray-300 px-3" value={editForm.parentId || ''} onChange={e => { const p = parents.find(x => x.id === e.target.value); setEditForm(f => ({ ...f!, parentId: e.target.value || undefined, parentName: p?.fullName, parentPhone: p?.phone })) }}><option value="">— Chưa chọn —</option>{parents.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></label>
                  <div className="grid gap-1 text-sm"><span>SĐT phụ huynh</span><input disabled className="h-9 rounded-lg border border-gray-200 bg-gray-100 px-3" value={editForm.parentPhone || ''} /></div>
                </div>
              </section>
              <section>
                <h4 className="font-medium mb-3">Điểm dừng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm"><span>Điểm đón</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full" value={editForm.pickupStopId || ''} onChange={e => { const sp = stops.find(x => x.id === e.target.value); setEditForm(f => ({ ...f!, pickupStopId: e.target.value || undefined, pickupStopName: sp?.name })) }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm"><span>Điểm trả</span>
                    <select className="h-9 rounded-lg border border-gray-300 px-3 w-full" value={editForm.dropoffStopId || ''} onChange={e => { const sp = stops.find(x => x.id === e.target.value); setEditForm(f => ({ ...f!, dropoffStopId: e.target.value || undefined, dropoffStopName: sp?.name })) }}>
                      <option value="">— Chưa chọn —</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                </div>
              </section>
              <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => { setShowEditModal(false); setEditingStudent(null); setEditForm(null) }} className="btn-secondary">Hủy</button><button type="submit" className="btn-primary">Cập nhật thông tin</button></div>
            </form>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
