import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Edit, Trash2, Search, Phone, Mail,
  Users, UserCheck, UserX, AlertTriangle, CreditCard,
  ChevronLeft, ChevronRight // Thêm icon điều hướng
} from 'lucide-react'

// Import API thực tế
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  Driver
} from '../lib/api' 

// CẤU HÌNH TRẠNG THÁI
const DRIVER_STATUSES = {
  'active': { label: 'Đang làm việc', color: 'bg-green-100 text-green-800' },
  'inactive': { label: 'Nghỉ phép', color: 'bg-gray-100 text-gray-800' },
  'locked': { label: 'Đã khóa', color: 'bg-red-100 text-red-800' },
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1) // State trang hiện tại
  const pageSize = 8 // Số dòng mỗi trang

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)

  // Loading & Error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Form States - Add
  const [addFullName, setAddFullName] = useState('')
  const [addPhone, setAddPhone] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addLicenseNumber, setAddLicenseNumber] = useState('')
  const [addLicenseClass, setAddLicenseClass] = useState('')
  const [addLicenseExpiry, setAddLicenseExpiry] = useState('') 
  const [addPassword, setAddPassword] = useState('')
  const [addStatus, setAddStatus] = useState<'active' | 'inactive' | 'locked'>('active')

  // Form States - Edit
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editLicenseNumber, setEditLicenseNumber] = useState('')
  const [editLicenseClass, setEditLicenseClass] = useState('')
  const [editLicenseExpiry, setEditLicenseExpiry] = useState('') 
  const [editPassword, setEditPassword] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'locked'>('active')

  // --- 1. LOAD DỮ LIỆU TỪ DB ---
  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDrivers()
      setDrivers(data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Không tải được danh sách tài xế')
    } finally {
      setLoading(false)
    }
  }

  // --- HELPER FUNCTIONS ---
  const toInputDate = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  const formatDateDisplay = (dateString: string | undefined | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return new Intl.DateTimeFormat('vi-VN').format(date) 
    } catch { return '-' }
  }

  const isExpiringSoon = (dateString: string | undefined | null) => {
    if (!dateString) return false
    const expiry = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays < 30 && diffDays >= 0
  }

  const isExpired = (dateString: string | undefined | null) => {
    if (!dateString) return false
    const expiry = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expiry < today
  }

  // --- LOGIC SEARCH & FILTER ---
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const term = searchTerm.toLowerCase()
      return (
        (d.fullName || '').toLowerCase().includes(term) ||
        (d.phone || '').includes(searchTerm) ||
        (d.licenseNumber || '').toLowerCase().includes(term)
      )
    })
  }, [drivers, searchTerm])

  // --- LOGIC PHÂN TRANG (PAGINATION) ---
  const maxPage = Math.max(1, Math.ceil(filteredDrivers.length / pageSize))
  
  const paginatedDrivers = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredDrivers.slice(start, start + pageSize)
  }, [filteredDrivers, page])

  const resetPage = () => setPage(1)

  // Stats
  const stats = useMemo(() => ({
    total: drivers.length,
    active: drivers.filter(d => d.status === 'active').length,
    inactive: drivers.filter(d => d.status === 'inactive').length,
    locked: drivers.filter(d => d.status === 'locked').length
  }), [drivers])


  // --- HANDLERS ---

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver)
    setEditFullName(driver.fullName || '')
    setEditPhone(driver.phone || '')
    setEditEmail(driver.email || '')
    setEditLicenseNumber(driver.licenseNumber || '')
    setEditLicenseClass(driver.licenseClass || '')
    setEditLicenseExpiry(toInputDate(driver.licenseExpiry))

    const currentStatus = (driver.status && ['active', 'inactive', 'locked'].includes(driver.status))
      ? driver.status as 'active' | 'inactive' | 'locked'
      : 'active';
    setEditStatus(currentStatus)

    setEditPassword('')
    setShowEditModal(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFullName || !addPhone || !addLicenseNumber || !addPassword) return
    setActionLoading(true)
    try {
      await createDriver({
        fullName: addFullName,
        phone: addPhone,
        email: addEmail || undefined,
        licenseNumber: addLicenseNumber,
        password: addPassword,
        licenseClass: addLicenseClass || undefined,
        licenseExpiry: addLicenseExpiry || undefined,
        status: addStatus
      })

      await fetchDrivers()
      setShowAddModal(false)

      // Reset form & Page
      setAddFullName(''); setAddPhone(''); setAddEmail('');
      setAddLicenseNumber(''); setAddLicenseClass(''); setAddLicenseExpiry('');
      setAddPassword(''); setAddStatus('active')
      resetPage() // Về trang 1 khi thêm mới
    } catch (e: any) {
      alert(e.message || 'Thêm tài xế thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDriver || !editingDriver.id) return
    setActionLoading(true)
    try {
      const payload: Partial<Driver> & { password?: string } = {
        fullName: editFullName,
        phone: editPhone,
        email: editEmail || undefined,
        licenseNumber: editLicenseNumber,
        licenseClass: editLicenseClass || undefined,
        licenseExpiry: editLicenseExpiry || undefined,
        status: editStatus as any
      }

      if (editPassword) {
        payload.password = editPassword;
      }

      await updateDriver(editingDriver.id, payload)
      await fetchDrivers()
      setShowEditModal(false)
      setEditingDriver(null)
    } catch (e: any) {
      alert(e.message || 'Cập nhật tài xế thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Xóa tài xế ${driver.fullName}?`) || !driver.id) return
    try {
      await deleteDriver(driver.id)
      setDrivers(prev => prev.filter(d => d.id !== driver.id))
      // Nếu xóa item cuối cùng của trang hiện tại, lùi về trang trước
      if (paginatedDrivers.length === 1 && page > 1) {
        setPage(p => p - 1)
      }
    } catch (e: any) {
      alert(e.message || 'Xóa tài xế thất bại')
    }
  }

  const renderStatusBadge = (status: string | undefined) => {
    const normalizedStatus = (status && ['active', 'inactive', 'locked'].includes(status))
      ? status as keyof typeof DRIVER_STATUSES
      : 'active';
    const config = DRIVER_STATUSES[normalizedStatus];

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER & STATS */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài xế</h1>
        <p className="text-gray-600 text-sm">Quản lý thông tin và trạng thái đội ngũ tài xế</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Users className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Tổng tài xế</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0"><UserCheck className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Đang làm việc</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0"><UserX className="w-6 h-6 text-gray-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Nghỉ phép</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Đã khóa</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.locked}</p></div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

      {/* TABLE SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Table */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Danh sách tài xế ({filteredDrivers.length})</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Tìm tên, SĐT, bằng lái..." 
                value={searchTerm} 
                onChange={e => { setSearchTerm(e.target.value); resetPage() }} // Reset trang khi search
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white" 
              />
            </div>
            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Thêm tài xế
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bằng lái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hết hạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Không tìm thấy tài xế nào</td></tr>
              ) : (
                // Dùng paginatedDrivers thay vì filteredDrivers
                paginatedDrivers.map(driver => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold mr-3">{driver.fullName ? driver.fullName.charAt(0).toUpperCase() : 'U'}</div>
                        <div><div className="text-sm font-medium text-gray-900">{driver.fullName}</div><div className="text-xs text-gray-500">ID: ...{driver.id?.toString().slice(-4)}</div></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-700"><Phone className="w-3 h-3 text-gray-400" />{driver.phone}</div>
                        {driver.email && <div className="flex items-center gap-2 text-gray-500 text-xs"><Mail className="w-3 h-3 text-gray-400" />{driver.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-medium">{driver.licenseNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.licenseClass ? (
                        <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-0.5 rounded border border-gray-300">
                          {driver.licenseClass}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {driver.licenseExpiry ? (
                          <>
                            <span className={`${isExpired(driver.licenseExpiry) ? 'text-red-600 font-bold' : isExpiringSoon(driver.licenseExpiry) ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                              {formatDateDisplay(driver.licenseExpiry)}
                            </span>
                            {isExpired(driver.licenseExpiry) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {isExpiringSoon(driver.licenseExpiry) && !isExpired(driver.licenseExpiry) && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                          </>
                        ) : <span className="text-gray-400 text-xs">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{renderStatusBadge(driver.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => handleEditDriver(driver)} className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(driver)} className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER (MỚI) --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm bg-gray-50/50">
          <div className="text-gray-600">Hiển thị <b>{paginatedDrivers.length}</b> / <b>{filteredDrivers.length}</b> tài xế</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </button>
            <span className="text-gray-700">Trang <b>{page}</b> / <b>{maxPage}</b></span>
            <button
              onClick={() => setPage(p => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50 shadow-sm"
            >
              Sau <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all scale-100">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Thêm tài xế mới</h3>
              <form className="space-y-4" onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label><input value={addFullName} onChange={e => setAddFullName(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label><input value={addPhone} onChange={e => setAddPhone(e.target.value)} type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={addEmail} onChange={e => setAddEmail(e.target.value)} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  </div>
                </div>

                {/* Phần Bằng Lái */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"><CreditCard className="w-3 h-3" /> Thông tin bằng lái</p>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Số bằng lái <span className="text-red-500">*</span></label><input value={addLicenseNumber} onChange={e => setAddLicenseNumber(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Hạng bằng</label><input value={addLicenseClass} onChange={e => setAddLicenseClass(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="B2, C..." /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label><input value={addLicenseExpiry} onChange={e => setAddLicenseExpiry(e.target.value)} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" /></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={addStatus} onChange={e => setAddStatus(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="active">Đang làm việc</option>
                    <option value="inactive">Nghỉ phép</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label><input value={addPassword} onChange={e => setAddPassword(e.target.value)} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required /></div>

                <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Hủy</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md" disabled={actionLoading}>{actionLoading ? 'Đang lưu...' : 'Thêm mới'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Cập nhật tài xế</h3>
              <form className="space-y-4" onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label><input value={editFullName} onChange={e => setEditFullName(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label><input value={editPhone} onChange={e => setEditPhone(e.target.value)} type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  </div>
                </div>

                {/* Phần Bằng Lái Edit */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"><CreditCard className="w-3 h-3" /> Thông tin bằng lái</p>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Số bằng lái</label><input value={editLicenseNumber} onChange={e => setEditLicenseNumber(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Hạng bằng</label><input value={editLicenseClass} onChange={e => setEditLicenseClass(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label><input value={editLicenseExpiry} onChange={e => setEditLicenseExpiry(e.target.value)} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white" /></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="active">Đang làm việc</option>
                    <option value="inactive">Nghỉ phép</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới (để trống nếu không đổi)</label><input value={editPassword} onChange={e => setEditPassword(e.target.value)} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" /></div>

                <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingDriver(null) }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Hủy</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-md" disabled={actionLoading}>{actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}