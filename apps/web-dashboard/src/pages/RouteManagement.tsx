import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, Search, MapPin, Users, GraduationCap } from 'lucide-react'
import { getRoutes, getStudents, getStops, createRoute, updateRoute, deleteRoute } from '../lib/api'

interface UiStop { id: string; name: string; address?: string }
interface UiRoute { id: string; name: string; description?: string; status: 'active' | 'inactive'; stops: UiStop[]; studentCount: number }
interface UiStudent { id: string; fullName: string; class?: string; status: 'active' | 'inactive'; parentName?: string; parentPhone?: string; routeId?: string; pickupStopId?: string; pickupStopName?: string }

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
  const [newRouteName, setNewRouteName] = useState('')
  const [newRouteStops, setNewRouteStops] = useState<UiStop[]>([])
  const [selectedStopForRoute, setSelectedStopForRoute] = useState('')
  const [editRouteStops, setEditRouteStops] = useState<UiStop[]>([])
  const [editRouteName, setEditRouteName] = useState('')
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStopForEdit, setSelectedStopForEdit] = useState('')

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
        setAllStops(stopsRaw.map(s => ({ id: s.id, name: s.name })))
        const stu = studentRaw.map(s => ({
          id: s.id,
          fullName: s.fullName,
          class: s.class,
          status: s.status,
          parentName: s.parent?.fullName,
          parentPhone: s.parent?.phone,
          routeId: s.route?.id,
          pickupStopId: s.pickupStop?.id,
          pickupStopName: s.pickupStop?.name
        }))
        setStudents(stu)
        // Map routes from backend shape (route.stops is array of { stopOrder, stop })
        const mapped: UiRoute[] = routeRaw.map((r: any) => {
          const stopList: UiStop[] = (r.stops || []).sort((a: any, b: any) => a.stopOrder - b.stopOrder).map((rs: any) => ({ id: rs.stop.id, name: rs.stop.name }))
          // Count students: by routeId OR pickupStopId in stopList
          const stopIds = new Set(stopList.map(s => s.id))
          const studentCount = stu.filter(st => st.status === 'active' && (st.routeId === r.id || (st.pickupStopId && stopIds.has(st.pickupStopId)))).length
          return { id: r.id, name: r.name, description: r.description || '', status: (r.status || 'active'), stops: stopList, studentCount }
        })
        setRoutes(mapped)
      } catch (e: any) { setError(e.message || 'Không tải được dữ liệu') } finally { setLoading(false) }
    }
    load()
  }, [])

  const filteredRoutes = useMemo(() => routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) || (route.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter
    return matchesSearch && matchesStatus
  }), [routes, searchTerm, statusFilter])

  const getStatusColor = (status: string) => status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  const getStatusText = (status: string) => status === 'active' ? 'Hoạt động' : 'Không hoạt động'

  const handleViewStudents = (route: UiRoute) => { setSelectedRoute(route); setShowStudentsModal(true) }
  const handleEditRoute = (route: UiRoute) => { setEditingRoute(route); setEditRouteStops([...route.stops]); setEditRouteName(route.name); setShowEditModal(true) }

  // Add route stops selection
  const handleAddStopToNewRoute = () => {
    if (!selectedStopForRoute) return
    const stop = allStops.find(s => s.id === selectedStopForRoute)
    if (stop && !newRouteStops.find(s => s.id === stop.id)) {
      setNewRouteStops(prev => [...prev, stop])
      setSelectedStopForRoute('')
    }
  }
  const handleRemoveStopFromNewRoute = (id: string) => setNewRouteStops(prev => prev.filter(s => s.id !== id))

  // Edit route change stop
  const handleChangeStopInRoute = (index: number, newStopId: string) => {
    const stop = allStops.find(s => s.id === newStopId)
    if (!stop) return
    setEditRouteStops(prev => prev.map((s, i) => i === index ? stop : s))
    setEditingStopIndex(null)
  }

  const handleRemoveStopInEdit = (id: string) => {
    setEditRouteStops(prev => prev.filter(s => s.id !== id))
    if (editingStopIndex !== null && editRouteStops[editingStopIndex]?.id === id) setEditingStopIndex(null)
  }

  // Create route
  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRouteName || newRouteStops.length === 0) return
    setSaving(true)
    try {
      const created = await createRoute({ name: newRouteName, stopIds: newRouteStops.map(s => s.id) })
      // Map created route
      const stopList: UiStop[] = (created.stops || []).sort((a: any, b: any) => a.stopOrder - b.stopOrder).map((rs: any) => ({ id: rs.stop.id, name: rs.stop.name }))
      const stopIds = new Set(stopList.map(s => s.id))
      const studentCount = students.filter(st => st.status === 'active' && (st.routeId === created.id || (st.pickupStopId && stopIds.has(st.pickupStopId)))).length
      setRoutes(r => [...r, { id: created.id, name: created.name, description: created.description || '', status: (created.status || 'active'), stops: stopList, studentCount }])
      setShowAddModal(false)
      setNewRouteName(''); setNewRouteStops([]); setSelectedStopForRoute('')
    } catch (e: any) { alert(e.message || 'Thêm tuyến đường thất bại') } finally { setSaving(false) }
  }

  // Update route
  const handleSaveEditRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoute) return
    setSaving(true)
    try {
      const updated = await updateRoute(editingRoute.id, { name: editRouteName, stopIds: editRouteStops.map(s => s.id) })
      const stopList: UiStop[] = (updated.stops || []).sort((a: any, b: any) => a.stopOrder - b.stopOrder).map((rs: any) => ({ id: rs.stop.id, name: rs.stop.name }))
      const stopIds = new Set(stopList.map(s => s.id))
      const studentCount = students.filter(st => st.status === 'active' && (st.routeId === updated.id || (st.pickupStopId && stopIds.has(st.pickupStopId)))).length
      setRoutes(prev => prev.map(r => r.id === updated.id ? { id: updated.id, name: updated.name, description: updated.description || '', status: (updated.status || 'active'), stops: stopList, studentCount } : r))
      setShowEditModal(false); setEditingRoute(null); setEditRouteStops([]); setEditingStopIndex(null)
    } catch (e: any) { alert(e.message || 'Cập nhật tuyến đường thất bại') } finally { setSaving(false) }
  }

  const handleDeleteRoute = async (route: UiRoute) => {
    if (!confirm(`Xóa tuyến đường "${route.name}"?`)) return
    try { await deleteRoute(route.id); setRoutes(prev => prev.filter(r => r.id !== route.id)) } catch (e: any) { alert(e.message || 'Xóa tuyến đường thất bại') }
  }

  // Students in selected route
  const studentsInSelectedRoute = useMemo(() => {
    if (!selectedRoute) return []
    const stopIds = new Set(selectedRoute.stops.map(s => s.id))
    return students.filter(st => st.status === 'active' && (st.routeId === selectedRoute.id || (st.pickupStopId && stopIds.has(st.pickupStopId))))
  }, [selectedRoute, students])

  const handleAddStopToEditRoute = () => {
    if (!selectedStopForEdit) return
    const stop = allStops.find(s => s.id === selectedStopForEdit)
    if (stop && !editRouteStops.find(s => s.id === stop.id)) {
      setEditRouteStops(prev => [...prev, stop])
      setSelectedStopForEdit('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tuyến đường</h1>
          <p className="text-gray-600 mt-2">Dữ liệu lấy trực tiếp từ hệ thống</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Thêm tuyến đường</span></button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm kiếm theo tên hoặc mô tả..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-[180px] shrink-0 border border-gray-300 rounded-lg px-3 py-2" aria-label="Lọc trạng thái tuyến">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && <div className="col-span-full text-center text-gray-500">Đang tải...</div>}
        {!loading && filteredRoutes.map(route => (
          <div key={route.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                {route.description && <p className="text-sm text-gray-600 mt-1">{route.description}</p>}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(route.status)}`}>{getStatusText(route.status)}</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEditRoute(route)} className="text-primary-600 hover:text-primary-900" title="Chỉnh sửa tuyến" aria-label="Chỉnh sửa tuyến"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteRoute(route)} className="text-red-600 hover:text-red-900" title="Xóa tuyến" aria-label="Xóa tuyến"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1"><MapPin className="w-4 h-4 text-blue-600" /></div>
                <p className="text-sm font-medium text-gray-900">{route.stops.length}</p>
                <p className="text-xs text-gray-600">Điểm dừng</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1"><Users className="w-4 h-4 text-green-600" /></div>
                <p className="text-sm font-medium text-gray-900">{route.studentCount}</p>
                <p className="text-xs text-gray-600">Học sinh</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Điểm dừng</h4>
              <div className="space-y-2">
                {route.stops.slice(0, 2).map((stop, i) => (
                  <div key={stop.id} className="flex items-center space-x-2 text-sm">
                    <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">{i + 1}</span>
                    <span className="text-gray-900">{stop.name}</span>
                  </div>
                ))}
                {route.stops.length > 2 && <p className="text-sm text-gray-500">+{route.stops.length - 2} điểm dừng khác</p>}
              </div>
              <div className="mt-3">
                <button onClick={() => handleViewStudents(route)} className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"><GraduationCap className="w-4 h-4" /><span>Xem học sinh ({route.studentCount})</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm tuyến đường mới</h3>
            <form className="space-y-6" onSubmit={handleCreateRoute}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tuyến đường</label>
                <input value={newRouteName} onChange={e => setNewRouteName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Tuyến A" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Chọn điểm dừng</h4>
                {newRouteStops.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {newRouteStops.map((s, i) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">{i + 1}</span>
                          <span className="text-sm font-medium text-gray-900">{s.name}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveStopFromNewRoute(s.id)} className="text-red-600 hover:text-red-900" title="Xóa điểm dừng" aria-label="Xóa điểm dừng"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Điểm dừng có sẵn</label>
                      <select value={selectedStopForRoute} onChange={e => setSelectedStopForRoute(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" aria-label="Chọn điểm dừng cho tuyến mới">
                        <option value="">-- Chọn điểm dừng --</option>
                        {allStops.filter(s => !newRouteStops.find(x => x.id === s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={handleAddStopToNewRoute} disabled={!selectedStopForRoute} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Thêm</span></button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setShowAddModal(false); setNewRouteName(''); setNewRouteStops([]); setSelectedStopForRoute('') }} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={saving || !newRouteName || newRouteStops.length === 0} className="btn-primary">{saving ? 'Đang lưu...' : 'Thêm tuyến đường'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa tuyến đường - {editingRoute.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600" aria-label="Đóng">✕</button>
            </div>
            <form className="space-y-6" onSubmit={handleSaveEditRoute}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tuyến đường</label>
                <input value={editRouteName} onChange={e => setEditRouteName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thứ tự điểm dừng hiện tại</h4>
                {editRouteStops.length > 0 ? (
                  <div className="space-y-3">
                    {editRouteStops.map((stop, index) => (
                      <div key={stop.id + '-' + index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</span>
                            <span className="font-medium text-gray-900">{stop.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setEditingStopIndex(editingStopIndex === index ? null : index)} className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"><Edit className="w-4 h-4" /><span className="text-sm">Thay đổi</span></button>
                            <button type="button" onClick={() => handleRemoveStopInEdit(stop.id)} className="text-red-600 hover:text-red-800" title="Xóa điểm dừng" aria-label="Xóa điểm dừng"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        {editingStopIndex === index && (
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn điểm dừng khác</label>
                            <div className="flex items-center gap-3">
                              <select onChange={e => handleChangeStopInRoute(index, e.target.value)} defaultValue="" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" aria-label="Chọn điểm dừng khác">
                                <option value="">-- Chọn mới --</option>
                                {allStops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <button type="button" onClick={() => setEditingStopIndex(null)} className="btn-secondary text-sm">Hủy</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có điểm dừng</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thêm điểm dừng</h4>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Điểm dừng có sẵn</label>
                    <select value={selectedStopForEdit} onChange={e => setSelectedStopForEdit(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" aria-label="Chọn điểm dừng để thêm">
                      <option value="">-- Chọn điểm dừng --</option>
                      {allStops.filter(s => !editRouteStops.find(x => x.id === s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={handleAddStopToEditRoute} disabled={!selectedStopForEdit} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">+ Thêm</button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingRoute(null); setEditRouteStops([]); setEditingStopIndex(null) }} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={saving || !editRouteName || editRouteStops.length === 0} className="btn-primary">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStudentsModal && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách học sinh - {selectedRoute.name}</h3>
              <button onClick={() => setShowStudentsModal(false)} className="text-gray-400 hover:text-gray-600" aria-label="Đóng">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phụ huynh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm đón</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsInSelectedRoute.map(st => (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{st.fullName}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{st.class || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{st.parentName || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{st.parentPhone || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{st.pickupStopName || '—'}</span></td>
                    </tr>
                  ))}
                  {studentsInSelectedRoute.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Không có học sinh trong tuyến này</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setShowStudentsModal(false)} className="btn-secondary">Đóng</button></div>
          </div>
        </div>
      )}
    </div>
  )
}