import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, Search, MapPin, Users, GraduationCap, ArrowRight } from 'lucide-react'
import { getRoutes, getStudents, getStops, createRoute, updateRoute, deleteRoute } from '../lib/api'

// Định nghĩa trạng thái hiển thị tiếng Việt
const ROUTE_STATUSES = {
  'active': { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
  'inactive': { label: 'Ngừng hoạt động', color: 'bg-red-100 text-red-800' },
}

interface UiStop { id: string; name: string; address?: string }
interface UiRoute {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  stops: UiStop[];
  studentCount: number
}
interface UiStudent {
  id: string;
  fullName: string;
  status: 'active' | 'inactive';
  routeId?: string;
  pickupStopId?: string;
  dropoffStopId?: string
}

export default function RouteManagement() {
  const [routes, setRoutes] = useState<UiRoute[]>([])
  const [students, setStudents] = useState<UiStudent[]>([])
  const [allStops, setAllStops] = useState<UiStop[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [selectedRoute, setSelectedRoute] = useState<UiRoute | null>(null)
  const [editingRoute, setEditingRoute] = useState<UiRoute | null>(null)

  // State form Add
  const [newRouteName, setNewRouteName] = useState('')
  const [newRouteDescription, setNewRouteDescription] = useState('')
  const [newRouteStatus, setNewRouteStatus] = useState('active')
  const [newRouteStops, setNewRouteStops] = useState<UiStop[]>([])
  const [selectedStopForRoute, setSelectedStopForRoute] = useState('')

  // State form Edit
  const [editRouteName, setEditRouteName] = useState('')
  const [editRouteDescription, setEditRouteDescription] = useState('')
  const [editRouteStatus, setEditRouteStatus] = useState('active')
  const [editRouteStops, setEditRouteStops] = useState<UiStop[]>([])
  const [selectedStopForEdit, setSelectedStopForEdit] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const [routeRaw, studentRaw, stopsRaw] = await Promise.all([
          getRoutes(),
          getStudents(),
          getStops()
        ])
        setAllStops(stopsRaw.map(s => ({ id: s.id, name: s.name, address: s.address })))

        const stu = studentRaw.map(s => ({
          id: s.id,
          fullName: s.fullName,
          status: s.status,
          routeId: s.route?.id || (s as any).routeId,
          pickupStopId: s.pickupStop?.id,
          dropoffStopId: s.dropoffStop?.id
        }))
        setStudents(stu)

        // Map routes
        const mapped: UiRoute[] = routeRaw.map((r: any) => {
          // Sắp xếp stops theo stopOrder
          const stopList: UiStop[] = (r.stops || [])
            .sort((a: any, b: any) => a.stopOrder - b.stopOrder)
            .map((rs: any) => ({ id: rs.stop?.id || rs.id, name: rs.stop?.name || rs.name }))

          // Đếm học sinh thuộc tuyến này
          const stopIds = new Set(stopList.map(s => s.id))
          const studentCount = stu.filter(st =>
            st.status === 'active' &&
            (st.routeId === r.id || (st.pickupStopId && stopIds.has(st.pickupStopId)))
          ).length

          return {
            id: r.id,
            name: r.name,
            description: r.description || '',
            status: (r.status || 'active').toLowerCase(),
            stops: stopList,
            studentCount
          }
        })
        setRoutes(mapped)
      } catch (e: any) { setError(e.message || 'Không tải được dữ liệu') } finally { setLoading(false) }
    }
    load()
  }, [])

  const filteredRoutes = useMemo(() => routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter
    return matchesSearch && matchesStatus
  }), [routes, searchTerm, statusFilter])

  // --- Handlers ---

  const handleAddStopToNewRoute = () => {
    if (!selectedStopForRoute) return
    const stop = allStops.find(s => s.id === selectedStopForRoute)
    // Cho phép thêm điểm dừng, kiểm tra trùng lặp nếu cần (ở đây cho phép đi vòng vèo nên không chặn trùng)
    if (stop && !newRouteStops.find(s => s.id === stop.id)) {
      setNewRouteStops(prev => [...prev, stop])
      setSelectedStopForRoute('')
    }
  }
  const handleRemoveStopFromNewRoute = (index: number) => {
    setNewRouteStops(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddStopToEditRoute = () => {
    if (!selectedStopForEdit) return
    const stop = allStops.find(s => s.id === selectedStopForEdit)
    if (stop && !editRouteStops.find(s => s.id === stop.id)) {
      setEditRouteStops(prev => [...prev, stop])
      setSelectedStopForEdit('')
    }
  }
  const handleRemoveStopFromEditRoute = (index: number) => {
    setEditRouteStops(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRouteName || newRouteStops.length === 0) return alert('Vui lòng nhập tên và chọn ít nhất 1 điểm dừng')

    setSaving(true)
    try {
      const created = await createRoute({
        name: newRouteName,
        description: newRouteDescription,
        status: newRouteStatus,
        stopIds: newRouteStops.map(s => s.id) // Gửi mảng ID theo thứ tự
      })

      // Update local state
      const stopList: UiStop[] = newRouteStops;
      const studentCount = 0; // Mới tạo chưa có học sinh

      setRoutes(r => [...r, {
        id: created.id,
        name: created.name,
        description: created.description || '',
        status: (created.status || 'active').toLowerCase() as 'active' | 'inactive',
        stops: stopList,
        studentCount
      }])

      setShowAddModal(false)
      // Reset form
      setNewRouteName(''); setNewRouteDescription(''); setNewRouteStatus('active'); setNewRouteStops([]); setSelectedStopForRoute('')
    } catch (e: any) { alert(e.message || 'Thêm tuyến đường thất bại') } finally { setSaving(false) }
  }

  const handleEditRoute = (route: UiRoute) => {
    setEditingRoute(route)
    setEditRouteName(route.name)
    setEditRouteDescription(route.description || '')
    setEditRouteStatus(route.status)
    setEditRouteStops([...route.stops])
    setShowEditModal(true)
  }

  const handleSaveEditRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoute) return
    setSaving(true)
    try {
      const updated = await updateRoute(editingRoute.id, {
        name: editRouteName,
        description: editRouteDescription,
        status: editRouteStatus,
        stopIds: editRouteStops.map(s => s.id)
      })

      // Tính lại student count (tương đối)
      const stopIds = new Set(editRouteStops.map(s => s.id))
      const studentCount = students.filter(st => st.status === 'active' && (st.routeId === updated.id || (st.pickupStopId && stopIds.has(st.pickupStopId)))).length

      setRoutes(prev => prev.map(r => r.id === updated.id ? {
        id: updated.id,
        name: updated.name,
        description: updated.description || '',
        status: (updated.status || 'active').toLowerCase() as 'active' | 'inactive',
        stops: editRouteStops,
        studentCount
      } : r))

      setShowEditModal(false); setEditingRoute(null)
    } catch (e: any) { alert(e.message || 'Cập nhật tuyến đường thất bại') } finally { setSaving(false) }
  }

  const handleDeleteRoute = async (route: UiRoute) => {
    if (!confirm(`Xóa tuyến đường "${route.name}"?`)) return
    try { await deleteRoute(route.id); setRoutes(prev => prev.filter(r => r.id !== route.id)) } catch (e: any) { alert(e.message || 'Xóa tuyến đường thất bại') }
  }

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase() as keyof typeof ROUTE_STATUSES
    const config = ROUTE_STATUSES[s] || ROUTE_STATUSES['active']
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>{config.label}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tuyến đường</h1>
          <p className="text-gray-600 mt-2">Xây dựng lộ trình và gán điểm dừng</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Thêm tuyến đường</span>
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm kiếm theo tên hoặc mô tả..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-[180px] shrink-0 border border-gray-300 rounded-lg px-3 py-2">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && <div className="col-span-full text-center text-gray-500">Đang tải...</div>}
        {!loading && filteredRoutes.map(route => (
          <div key={route.id} className="card flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {route.name}
                </h3>
                <div className="mt-1">{renderStatusBadge(route.status)}</div>
                {route.description && <p className="text-sm text-gray-600 mt-2">{route.description}</p>}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEditRoute(route)} className="text-primary-600 hover:text-primary-900 p-1" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteRoute(route)} className="text-red-600 hover:text-red-900 p-1" title="Xóa"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1"><MapPin className="w-4 h-4" /><span className="font-bold">{route.stops.length}</span></div>
                <p className="text-xs text-gray-500">Điểm dừng</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1"><Users className="w-4 h-4" /><span className="font-bold">{route.studentCount}</span></div>
                <p className="text-xs text-gray-500">Học sinh</p>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Lộ trình</h4>
              <div className="relative border-l-2 border-primary-200 ml-3 space-y-4 pb-2">
                {route.stops.slice(0, 3).map((stop, i) => (
                  <div key={stop.id + i} className="relative pl-6">
                    <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                    </span>
                    <p className="text-sm font-medium text-gray-900">{stop.name}</p>
                  </div>
                ))}
                {route.stops.length > 3 && (
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-400"></span>
                    <p className="text-sm text-gray-500 italic">...và {route.stops.length - 3} điểm khác</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm tuyến đường mới</h3>
            <form className="space-y-5" onSubmit={handleCreateRoute}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tuyến</label>
                  <input value={newRouteName} onChange={e => setNewRouteName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ví dụ: Tuyến 01" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={newRouteStatus} onChange={e => setNewRouteStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={newRouteDescription} onChange={e => setNewRouteDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} placeholder="Mô tả lộ trình..." />
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex justify-between items-center">
                  <span>Danh sách điểm dừng ({newRouteStops.length})</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3 max-h-60 overflow-y-auto">
                  {newRouteStops.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">Chưa có điểm dừng nào</p>
                  ) : (
                    <div className="space-y-2">
                      {newRouteStops.map((s, i) => (
                        <div key={s.id + i} className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveStopFromNewRoute(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <select value={selectedStopForRoute} onChange={e => setSelectedStopForRoute(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">-- Chọn điểm dừng để thêm --</option>
                    {allStops.filter(s => !newRouteStops.find(n => n.id === s.id)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddStopToNewRoute} disabled={!selectedStopForRoute} className="btn-primary py-2 px-4 disabled:opacity-50">Thêm</button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Đang lưu...' : 'Tạo tuyến'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && editingRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa tuyến đường</h3>
            <form className="space-y-5" onSubmit={handleSaveEditRoute}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên tuyến</label>
                  <input value={editRouteName} onChange={e => setEditRouteName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={editRouteStatus} onChange={e => setEditRouteStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={editRouteDescription} onChange={e => setEditRouteDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} />
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Danh sách điểm dừng ({editRouteStops.length})</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3 max-h-60 overflow-y-auto">
                  {editRouteStops.map((s, i) => (
                    <div key={s.id + i} className="flex items-center justify-between bg-white p-2 rounded shadow-sm border border-gray-100 mb-2 last:mb-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <span className="text-sm font-medium">{s.name}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveStopFromEditRoute(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <select value={selectedStopForEdit} onChange={e => setSelectedStopForEdit(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">-- Chọn điểm dừng để thêm --</option>
                    {allStops.filter(s => !editRouteStops.find(n => n.id === s.id)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddStopToEditRoute} disabled={!selectedStopForEdit} className="btn-primary py-2 px-4 disabled:opacity-50">Thêm</button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingRoute(null) }} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Đang lưu...' : 'Cập nhật'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}