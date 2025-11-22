import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { getAllBuses, createBus, updateBus, deleteBus, Bus } from '../lib/api'

export default function BusManagement() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [newLicensePlate, setNewLicensePlate] = useState('')
  const [newCapacity, setNewCapacity] = useState<number | ''>('')
  const [editLicensePlate, setEditLicensePlate] = useState('')
  const [editCapacity, setEditCapacity] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAllBuses()
        setBuses(data)
      } catch (e: any) {
        setError(e.message || 'Không tải được danh sách xe buýt')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredBuses = buses.filter(bus => bus.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEditBus = (bus: Bus) => {
    setEditingBus(bus)
    setEditLicensePlate(bus.licensePlate)
    setEditCapacity(bus.capacity || '')
    setShowEditModal(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLicensePlate || !newCapacity) return
    setActionLoading(true)
    try {
      const created = await createBus({ licensePlate: newLicensePlate, capacity: Number(newCapacity) })
      setBuses(prev => [...prev, created])
      setShowAddModal(false)
      setNewLicensePlate('')
      setNewCapacity('')
    } catch (e: any) {
      alert(e.message || 'Thêm xe buýt thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBus) return
    setActionLoading(true)
    try {
      const updated = await updateBus(String(editingBus.id), { licensePlate: editLicensePlate, capacity: Number(editCapacity) })
      setBuses(prev => prev.map(b => b.id === updated.id ? updated : b))
      setShowEditModal(false)
      setEditingBus(null)
    } catch (e: any) {
      alert(e.message || 'Cập nhật xe buýt thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (bus: Bus) => {
    if (!confirm(`Xóa xe buýt ${bus.licensePlate}?`)) return
    try {
      await deleteBus(String(bus.id))
      setBuses(prev => prev.filter(b => b.id !== bus.id))
    } catch (e: any) {
      alert(e.message || 'Xóa xe buýt thất bại')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Xe buýt</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cơ bản của xe buýt</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Thêm xe buýt</span>
        </button>
      </div>

      <div className="card">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo biển số xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biển số xe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức chứa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuses.map(bus => (
                  <tr key={bus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bus.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bus.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bus.capacity} chỗ</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${bus.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : bus.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{bus.status || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEditBus(bus)} className="text-primary-600 hover:text-primary-900" aria-label="Chỉnh sửa xe buýt" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Chỉnh sửa</span>
                        </button>
                        <button onClick={() => handleDelete(bus)} className="text-red-600 hover:text-red-900" aria-label="Xóa xe buýt" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBuses.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Không có xe buýt</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm xe buýt mới</h3>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div>
                <label htmlFor="add-license" className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                <input
                  id="add-license"
                  type="text"
                  value={newLicensePlate}
                  onChange={(e) => setNewLicensePlate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="29A-12345"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-capacity" className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                <input
                  id="add-capacity"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="45"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Đang lưu...' : 'Thêm xe buýt'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingBus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa xe buýt</h3>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label htmlFor="edit-license" className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                <input
                  id="edit-license"
                  type="text"
                  value={editLicensePlate}
                  onChange={(e) => setEditLicensePlate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="29A-12345"
                  title="Biển số xe"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-capacity" className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                <input
                  id="edit-capacity"
                  type="number"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="45"
                  title="Sức chứa"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingBus(null) }} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'Đang lưu...' : 'Cập nhật'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}