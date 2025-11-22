import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Phone, Mail } from 'lucide-react'
import { getDrivers, createDriver, updateDriver, deleteDriver, Driver } from '../lib/api'

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [addFullName, setAddFullName] = useState('')
  const [addPhone, setAddPhone] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addLicenseNumber, setAddLicenseNumber] = useState('')
  const [addPassword, setAddPassword] = useState('')

  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editLicenseNumber, setEditLicenseNumber] = useState('')
  const [editPassword, setEditPassword] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getDrivers()
        setDrivers(data)
      } catch (e: any) {
        setError(e.message || 'Không tải được danh sách tài xế')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredDrivers = drivers.filter(d => {
    const term = searchTerm.toLowerCase()
    return (
      (d.fullName || '').toLowerCase().includes(term) ||
      (d.phone || '').includes(searchTerm) ||
      (d.licenseNumber || '').toLowerCase().includes(term)
    )
  })

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver)
    setEditFullName(driver.fullName || '')
    setEditPhone(driver.phone || '')
    setEditEmail(driver.email || '')
    setEditLicenseNumber(driver.licenseNumber || '')
    setEditPassword('')
    setShowEditModal(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFullName || !addPhone || !addLicenseNumber || !addPassword) return
    setActionLoading(true)
    try {
      const created = await createDriver({
        fullName: addFullName,
        phone: addPhone,
        email: addEmail || undefined,
        licenseNumber: addLicenseNumber,
        password: addPassword
      })
      setDrivers(prev => [...prev, created])
      setShowAddModal(false)
      setAddFullName('')
      setAddPhone('')
      setAddEmail('')
      setAddLicenseNumber('')
      setAddPassword('')
    } catch (e: any) {
      alert(e.message || 'Thêm tài xế thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDriver) return
    setActionLoading(true)
    try {
      const updated = await updateDriver(String(editingDriver.id), {
        fullName: editFullName,
        phone: editPhone,
        email: editEmail || undefined,
        licenseNumber: editLicenseNumber,
        password: editPassword || undefined
      })
      setDrivers(prev => prev.map(d => (d.id === updated.id ? updated : d)))
      setShowEditModal(false)
      setEditingDriver(null)
    } catch (e: any) {
      alert(e.message || 'Cập nhật tài xế thất bại')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Xóa tài xế ${driver.fullName}?`)) return
    try {
      await deleteDriver(String(driver.id))
      setDrivers(prev => prev.filter(d => d.id !== driver.id))
    } catch (e: any) {
      alert(e.message || 'Xóa tài xế thất bại')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài xế</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cơ bản của tài xế</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm tài xế</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại hoặc số bằng lái..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bằng lái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Đang tải...</td></tr>
              ) : filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className="inline-flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{driver.phone}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className="inline-flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" />{driver.email || '-'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.licenseNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleEditDriver(driver)} className="text-primary-600 hover:text-primary-900" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(driver)} className="text-red-600 hover:text-red-900" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredDrivers.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Không có tài xế</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thêm tài xế mới
            </h3>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div>
                <label htmlFor="add-fullname" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  id="add-fullname"
                  value={addFullName}
                  onChange={e => setAddFullName(e.target.value)}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  id="add-phone"
                  value={addPhone}
                  onChange={e => setAddPhone(e.target.value)}
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0901234567"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (tùy chọn)
                </label>
                <input
                  id="add-email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="driver@domain.com"
                />
              </div>
              <div>
                <label htmlFor="add-license" className="block text-sm font-medium text-gray-700 mb-1">
                  Số bằng lái
                </label>
                <input
                  id="add-license"
                  value={addLicenseNumber}
                  onChange={e => setAddLicenseNumber(e.target.value)}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="D123456789"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  id="add-password"
                  value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••"
                  required
                />
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
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang lưu...' : 'Thêm tài xế'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chỉnh sửa tài xế
            </h3>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label htmlFor="edit-fullname" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  id="edit-fullname"
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  id="edit-phone"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0901234567"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="edit-email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="driver@domain.com"
                />
              </div>
              <div>
                <label htmlFor="edit-license" className="block text-sm font-medium text-gray-700 mb-1">
                  Số bằng lái
                </label>
                <input
                  id="edit-license"
                  value={editLicenseNumber}
                  onChange={e => setEditLicenseNumber(e.target.value)}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="D123456789"
                />
              </div>
              <div>
                <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới (để trống nếu không đổi)
                </label>
                <input
                  id="edit-password"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingDriver(null)
                  }}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}