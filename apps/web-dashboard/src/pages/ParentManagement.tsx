import { useEffect, useMemo, useState } from 'react'
import { Plus, Edit, Trash2, Search, Phone, User } from 'lucide-react'
import { getParents, createParent, updateParent, deleteParent } from '../lib/api'

interface ParentUI {
    id: string
    fullName: string
    phone: string
    email?: string
    address?: string
    status?: 'active' | 'inactive'
}

export default function ParentManagement() {
    const [parents, setParents] = useState<ParentUI[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 10

    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState<ParentUI | null>(null)
    const [addForm, setAddForm] = useState<Omit<ParentUI, 'id'>>({ fullName: '', phone: '', email: '', address: '', status: 'active' })
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true); setError(null)
            try {
                const data = await getParents()
                setParents(data)
            } catch (e: any) {
                setError(e.message || 'Không tải được danh sách phụ huynh')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        return parents.filter(p =>
            !term || p.fullName.toLowerCase().includes(term) || p.phone.includes(term) || (p.email || '').toLowerCase().includes(term)
        )
    }, [parents, searchTerm])

    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [filtered, page])

    const openAdd = () => { setAddForm({ fullName: '', phone: '', email: '', address: '', status: 'active' }); setShowAddModal(true) }
    const openEdit = (p: ParentUI) => { setEditForm({ ...p }); setShowEditModal(true) }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addForm.fullName || !addForm.phone) return alert('Tên và SĐT là bắt buộc')
        setActionLoading(true)
        try {
            const created = await createParent({
                fullName: addForm.fullName,
                phone: addForm.phone,
                email: addForm.email || undefined,
                address: addForm.address || undefined,
                status: addForm.status || 'active'
            })
            setParents(prev => [...prev, created])
            setShowAddModal(false)
            setPage(1)
        } catch (e: any) {
            alert(e.message || 'Thêm phụ huynh thất bại')
        } finally {
            setActionLoading(false)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editForm) return
        if (!editForm.fullName || !editForm.phone) return alert('Tên và SĐT là bắt buộc')
        setActionLoading(true)
        try {
            const updated = await updateParent(editForm.id, {
                fullName: editForm.fullName,
                phone: editForm.phone,
                email: editForm.email || undefined,
                address: editForm.address || undefined,
                status: editForm.status || 'active'
            })
            setParents(prev => prev.map(p => p.id === editForm.id ? updated : p))
            setShowEditModal(false); setEditForm(null)
        } catch (e: any) {
            alert(e.message || 'Cập nhật phụ huynh thất bại')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa phụ huynh này?')) return
        try {
            await deleteParent(id)
            setParents(prev => prev.filter(p => p.id !== id))
            setPage(1)
        } catch (e: any) {
            alert(e.message || 'Xóa thất bại')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Phụ huynh</h1>
                    <p className="text-gray-600 text-sm mt-1">Quản lý hồ sơ phụ huynh và thông tin liên hệ</p>
                </div>
                <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>Thêm phụ huynh</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
                            placeholder="Tìm theo tên, SĐT, email…"
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Danh sách phụ huynh ({filtered.length})</h2>
                </div>

                <table className="w-full table-auto text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left text-gray-600">
                            <th className="px-4 py-3 font-medium">Phụ huynh</th>
                            <th className="px-4 py-3 font-medium">SĐT</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            {/* Đã bỏ cột Địa chỉ */}
                            <th className="px-4 py-3 font-medium text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={4} className="py-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {!loading && paginated.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">Không có dữ liệu phù hợp.</td></tr>}
                        {!loading && paginated.map((p, i) => (
                            <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{p.fullName}</div>
                                            <div className="text-xs text-gray-500">#{p.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4" />
                                        <span className="font-medium">{p.phone}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{p.email || '—'}</td>
                                {/* Bỏ ô địa chỉ */}
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Chỉnh sửa"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm">
                    <div className="text-gray-600">Hiển thị <b>{paginated.length}</b> / <b>{filtered.length}</b> phụ huynh</div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(1)} disabled={page <= 1} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50" title="Trang đầu">«</button>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50">Trước</button>
                        <span className="text-gray-700 mx-2">Trang <b>{page}</b> / <b>{maxPage}</b></span>
                        <button onClick={() => setPage(p => Math.min(maxPage, p + 1))} disabled={page >= maxPage} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50">Sau</button>
                        <button onClick={() => setPage(maxPage)} disabled={page >= maxPage} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50" title="Trang cuối">»</button>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Thêm phụ huynh</h3>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="grid gap-1 text-sm"><span>Họ và tên *</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={addForm.fullName} onChange={e => setAddForm(f => ({ ...f, fullName: e.target.value }))} /></label>
                                <label className="grid gap-1 text-sm"><span>SĐT *</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} /></label>
                                <label className="grid gap-1 text-sm"><span>Email</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={addForm.email || ''} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} /></label>
                                <label className="grid gap-1 text-sm"><span>Địa chỉ</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={addForm.address || ''} onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))} /></label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Hủy</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-md" disabled={actionLoading}>Thêm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && editForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Chỉnh sửa phụ huynh</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="grid gap-1 text-sm"><span>Họ và tên *</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f!, fullName: e.target.value }))} /></label>
                                <label className="grid gap-1 text-sm"><span>SĐT *</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f!, phone: e.target.value }))} /></label>
                                <label className="grid gap-1 text-sm"><span>Email</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f!, email: e.target.value }))} /></label>
                                <label className="grid gap-1 text-sm"><span>Địa chỉ</span><input className="h-9 rounded-lg border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-blue-500" value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f!, address: e.target.value }))} /></label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowEditModal(false); setEditForm(null) }} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Hủy</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-md" disabled={actionLoading}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}