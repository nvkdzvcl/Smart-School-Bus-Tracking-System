import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Edit, Trash2, Search,
  Bus as BusIcon, CheckCircle, Wrench, WifiOff, MoreVertical,
  MapPin, ShieldCheck, ChevronLeft, ChevronRight // Thêm icon điều hướng
} from 'lucide-react'
import { getAllBuses, createBus, updateBus, deleteBus, Bus } from '../lib/api'

// Mở rộng type Bus local để demo các trường mới
interface BusWithDetails extends Bus {
  gpsDeviceId?: string;
  insuranceExpiry?: string;
}

// 1. CẤU HÌNH STATUS CHO BADGE
const BUS_STATUSES = {
  'active': {
    label: 'Đang hoạt động',
    color: 'text-green-800 bg-green-100'
  },
  'maintenance': {
    label: 'Bảo dưỡng',
    color: 'text-yellow-800 bg-yellow-100'
  },
  'inactive': {
    label: 'Ngoại tuyến',
    color: 'text-red-800 bg-red-100'
  },
}

export default function BusManagement() {
  const [buses, setBuses] = useState<BusWithDetails[]>([])
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1) // State trang hiện tại
  const pageSize = 8 // Số dòng mỗi trang

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBus, setEditingBus] = useState<BusWithDetails | null>(null)

  // State cho form ADD
  const [newLicensePlate, setNewLicensePlate] = useState('')
  const [newCapacity, setNewCapacity] = useState<number | ''>('')
  const [newStatus, setNewStatus] = useState('active')
  const [newGpsDevice, setNewGpsDevice] = useState('')
  const [newInsuranceExpiry, setNewInsuranceExpiry] = useState('')

  // State cho form EDIT
  const [editLicensePlate, setEditLicensePlate] = useState('')
  const [editCapacity, setEditCapacity] = useState<number | ''>('')
  const [editStatus, setEditStatus] = useState('active')
  const [editGpsDevice, setEditGpsDevice] = useState('')
  const [editInsuranceExpiry, setEditInsuranceExpiry] = useState('')

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

  // --- LOGIC TÍNH TOÁN THỐNG KÊ ---
  const stats = useMemo(() => ({
    total: buses.length,
    active: buses.filter(b => (b.status || '').toLowerCase() === 'active').length,
    maintenance: buses.filter(b => (b.status || '').toLowerCase() === 'maintenance').length,
    inactive: buses.filter(b => (b.status || '').toLowerCase() === 'inactive').length
  }), [buses])

  // --- LOGIC SEARCH & FILTER ---
  const filteredBuses = useMemo(() => {
    return buses.filter(bus =>
      bus.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.gpsDeviceId || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [buses, searchTerm])

  // --- LOGIC PHÂN TRANG (PAGINATION) ---
  const maxPage = Math.max(1, Math.ceil(filteredBuses.length / pageSize))
  
  const paginatedBuses = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredBuses.slice(start, start + pageSize)
  }, [filteredBuses, page])

  const resetPage = () => setPage(1)

  // --- HANDLERS ---
  const handleEditBus = (bus: BusWithDetails) => {
    setEditingBus(bus)
    setEditLicensePlate(bus.licensePlate)
    setEditCapacity(bus.capacity || '')
    setEditStatus((bus.status || 'active').toLowerCase())
    setEditGpsDevice(bus.gpsDeviceId || '')
    setEditInsuranceExpiry(bus.insuranceExpiry || '')
    setShowEditModal(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLicensePlate || !newCapacity) return
    setActionLoading(true)
    try {
      const created = await createBus({
        licensePlate: newLicensePlate,
        capacity: Number(newCapacity),
        status: newStatus.toLowerCase() as any,
        gpsDeviceId: newGpsDevice || undefined,
        insuranceExpiry: newInsuranceExpiry || undefined,
      })

      const createdWithDetails = {
        ...created,
        gpsDeviceId: newGpsDevice,
        insuranceExpiry: newInsuranceExpiry
      }

      setBuses(prev => [...prev, createdWithDetails])
      setShowAddModal(false)
      // Reset form & page
      setNewLicensePlate(''); setNewCapacity(''); setNewStatus('active');
      setNewGpsDevice(''); setNewInsuranceExpiry('');
      resetPage()
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
      const updated = await updateBus(String(editingBus.id), {
        licensePlate: editLicensePlate,
        capacity: Number(editCapacity),
        status: editStatus.toLowerCase() as any,
        gpsDeviceId: editGpsDevice || undefined,
        insuranceExpiry: editInsuranceExpiry || undefined,
      })

      const updatedWithDetails = {
        ...updated,
        gpsDeviceId: editGpsDevice,
        insuranceExpiry: editInsuranceExpiry
      }

      setBuses(prev => prev.map(b => b.id === updated.id ? updatedWithDetails : b))
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
      // Nếu xóa item cuối cùng của trang hiện tại, lùi về trang trước
      if (paginatedBuses.length === 1 && page > 1) {
          setPage(p => p - 1)
      }
    } catch (e: any) {
      alert(e.message || 'Xóa xe buýt thất bại')
    }
  }

  const renderStatusBadge = (status: string | undefined) => {
    const normalizedStatus = (status || 'active').toLowerCase();
    const config = BUS_STATUSES[normalizedStatus as keyof typeof BUS_STATUSES] || {
      label: status || 'N/A',
      color: 'text-gray-800 bg-gray-100'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER TITLE */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xe buýt</h1>
        <p className="text-gray-600 text-sm">Quản lý đội xe và thiết bị định vị</p>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <BusIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng số xe</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Bảo dưỡng</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.maintenance}</p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <WifiOff className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ngoại tuyến</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

      {/* 3. MAIN TABLE SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Header Table */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách xe ({filteredBuses.length})
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm biển số, GPS..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); resetPage() }} // Reset trang khi search
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm xe
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin xe</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị GPS</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạn bảo hiểm</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredBuses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Không tìm thấy xe buýt nào</td></tr>
              ) : (
                // MAP QUA PAGINATED BUSES THAY VÌ FILTERED
                paginatedBuses.map(bus => (
                  <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                    {/* Cột Thông tin xe */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{bus.licensePlate}</span>
                        <span className="text-xs text-gray-500">Sức chứa: {bus.capacity} chỗ</span>
                      </div>
                    </td>

                    {/* Cột GPS Device */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${bus.gpsDeviceId ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                          {bus.gpsDeviceId || 'Chưa gắn'}
                        </span>
                      </div>
                    </td>

                    {/* Cột Bảo hiểm */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${bus.insuranceExpiry ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                          {bus.insuranceExpiry || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderStatusBadge(bus.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <div className="group relative inline-block text-left">
                          <div className="flex gap-3">
                            <button onClick={() => handleEditBus(bus)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(bus)} className="text-red-600 hover:text-red-900 transition-colors" title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER (MỚI) --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm">
          <div className="text-gray-600">Hiển thị <b>{paginatedBuses.length}</b> / <b>{filteredBuses.length}</b> xe</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </button>
            <span className="text-gray-700">Trang <b>{page}</b> / <b>{maxPage}</b></span>
            <button
              onClick={() => setPage(p => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Sau <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Thêm xe buýt mới</h3>
              <form className="space-y-4" onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe <span className="text-red-500">*</span></label>
                    <input
                      value={newLicensePlate}
                      onChange={e => setNewLicensePlate(e.target.value)}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="29A-12345"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa <span className="text-red-500">*</span></label>
                    <input
                      value={newCapacity}
                      onChange={e => setNewCapacity(e.target.value ? Number(e.target.value) : '')}
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="45"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị GPS</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={newGpsDevice}
                      onChange={e => setNewGpsDevice(e.target.value)}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mã thiết bị (VD: GPS-001)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn bảo hiểm</label>
                  <input
                    value={newInsuranceExpiry}
                    onChange={e => setNewInsuranceExpiry(e.target.value)}
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="maintenance">Bảo dưỡng</option>
                    <option value="inactive">Ngoại tuyến</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t mt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Hủy</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-md" disabled={actionLoading}>{actionLoading ? 'Đang lưu...' : 'Thêm mới'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && editingBus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Chỉnh sửa xe buýt</h3>
              <form className="space-y-4" onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                    <input
                      value={editLicensePlate}
                      onChange={e => setEditLicensePlate(e.target.value)}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                    <input
                      value={editCapacity}
                      onChange={e => setEditCapacity(e.target.value ? Number(e.target.value) : '')}
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị GPS</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={editGpsDevice}
                      onChange={e => setEditGpsDevice(e.target.value)}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="GPS-XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn bảo hiểm</label>
                  <input
                    value={editInsuranceExpiry}
                    onChange={e => setEditInsuranceExpiry(e.target.value)}
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="maintenance">Bảo dưỡng</option>
                    <option value="inactive">Ngoại tuyến</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t mt-2">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingBus(null) }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Hủy</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-md" disabled={actionLoading}>{actionLoading ? 'Lưu thay đổi' : 'Lưu thay đổi'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}