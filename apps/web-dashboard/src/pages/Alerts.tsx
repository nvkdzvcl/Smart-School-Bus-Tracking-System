import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, X, Search } from 'lucide-react'
import { getReports, type Report, getReportById, type ReportDetail, updateReport, sendNotification } from '../lib/api'
import { getDriverSocket } from '../lib/socket'

export default function Alerts() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [detail, setDetail] = useState<ReportDetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // Filters
    const [q, setQ] = useState('')
    const [status, setStatus] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'rejected'>('all')
    const [type, setType] = useState<'all' | Report['type']>('all')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [priority, setPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')

    // Toast
    const [toast, setToast] = useState<string | null>(null)
    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const INCIDENT_TYPE_LABELS: Record<string, string> = {
        student_absent: 'Học sinh vắng',
        incident_traffic: 'Kẹt xe',
        incident_vehicle: 'Xe hỏng',
        incident_accident: 'Tai nạn nhẹ',
        complaint: 'Phản hồi',
        other: 'Khác',
    }

    const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
        pending: { text: 'Chờ tiếp nhận', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
        in_progress: { text: 'Đang xử lý', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        resolved: { text: 'Đã xử lý', cls: 'bg-green-50 text-green-700 border-green-200' },
        rejected: { text: 'Đã hủy', cls: 'bg-red-50 text-red-700 border-red-200' },
    }

    const PRIORITY_LABEL: Record<string, { text: string; cls: string }> = {
        low: { text: 'Thấp', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
        medium: { text: 'Trung bình', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
        high: { text: 'Cao', cls: 'bg-red-50 text-red-700 border-red-200' },
    }

    const [resolutionNote, setResolutionNote] = useState('')
    const [showNotify, setShowNotify] = useState(false)
    const [notifyTitle, setNotifyTitle] = useState('')
    const [notifyContent, setNotifyContent] = useState('')
    const [notifyPriority, setNotifyPriority] = useState<'normal' | 'important' | 'urgent'>('normal')
    const [notifyTarget, setNotifyTarget] = useState<'drivers' | 'parents'>('parents')
    const [notifyLoading, setNotifyLoading] = useState(false)

    const load = async () => {
        setLoading(true); setError(null)
        try {
            const reportsRes = await getReports()
            setReports(reportsRes || [])
        } catch (e: any) {
            setError(e?.message || 'Không tải được dữ liệu')
        } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const filtered = useMemo(() => {
        return reports.filter(r => {
            if (status !== 'all' && r.status !== status) return false
            if (type !== 'all' && r.type !== type) return false
            if (q && !(r.title?.toLowerCase().includes(q.toLowerCase()) || r.content?.toLowerCase().includes(q.toLowerCase()))) return false
            if (from && new Date(r.createdAt) < new Date(from)) return false
            if (to) {
                const end = new Date(to)
                end.setHours(23, 59, 59, 999)
                if (new Date(r.createdAt) > end) return false
            }
            if (priority !== 'all' && (r as any).priority && (r as any).priority !== priority) return false
            return true
        })
    }, [reports, status, type, q, from, to, priority])

    const openDetail = async (id: string) => {
        setSelectedId(id); setDetail(null); setDetailLoading(true)
        try { setDetail(await getReportById(id)) } catch (e) { /* noop */ } finally { setDetailLoading(false) }
    }

    const setStatusAction = async (id: string, next: Report['status']) => {
        setActionLoading(true)
        try {
            let payload: any = { status: next }
            if (next === 'resolved' && resolutionNote.trim() && detail) {
                payload.content = `${detail.content}\n\n[Giải quyết]: ${resolutionNote.trim()}`
            }
            const updated = await updateReport(id, payload)
            setReports(prev => prev.map(r => r.id === updated.id ? { ...r, status: updated.status, content: updated.content || r.content } : r))
            if (selectedId === id) setDetail(updated)
            if (next === 'resolved') setResolutionNote('')
        } catch (e: any) {
            alert(e?.message || 'Không cập nhật được trạng thái. Có thể DB chưa hỗ trợ trạng thái mới, cần migration.')
        } finally { setActionLoading(false) }
    }

    const handleSendNotify = async () => {
        if (!notifyTitle.trim() || !notifyContent.trim()) return alert('Vui lòng nhập tiêu đề và nội dung')
        setNotifyLoading(true)
        try {
            await sendNotification({ title: notifyTitle.trim(), content: notifyContent.trim(), priority: notifyPriority, targetGroup: notifyTarget })
            setShowNotify(false)
        } catch (e: any) {
            alert(e?.message || 'Gửi thông báo thất bại')
        } finally { setNotifyLoading(false) }
    }

    const closeDetail = () => { setSelectedId(null); setDetail(null) }

    useEffect(() => {
        const socket = getDriverSocket()
        const onCreated = (r: Report) => {
            setReports(prev => [{ ...r }, ...prev])
            setToast('Có báo cáo sự cố mới từ tài xế')
        }
        socket.on('report_created', onCreated)
        return () => { socket.off('report_created', onCreated) }
    }, [])

    useEffect(() => {
        if (!detail) return
        const baseTitle = `Thông báo: ${INCIDENT_TYPE_LABELS[detail.type] || 'Sự cố'}`
        const baseContent = detail.type === 'incident_traffic'
            ? 'Kính gửi phụ huynh: Chuyến xe có thể đến trễ do kẹt xe. Rất mong quý phụ huynh thông cảm.'
            : detail.type === 'incident_vehicle'
                ? 'Kính gửi phụ huynh: Xe gặp sự cố kỹ thuật. Chúng tôi đang xử lý và sẽ cập nhật sớm.'
                : detail.type === 'student_absent'
                    ? `Ghi nhận học sinh ${detail.student?.fullName || ''} vắng mặt.`
                    : detail.content
        setNotifyTitle(baseTitle)
        setNotifyContent(baseContent)
    }, [detail])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý sự cố</h1>
                    <p className="text-gray-600 mt-2">Hiển thị và theo dõi báo cáo sự cố từ tài xế</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={load} className="btn-secondary">{loading ? 'Đang tải...' : 'Làm mới'}</button>
                </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Báo cáo từ tài xế</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" /> Cập nhật: {new Date().toLocaleTimeString()}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="all">Tất cả trạng thái</option>
                        {Object.entries(STATUS_LABEL).map(([key, { text }]) => (
                            <option key={key} value={key}>{text}</option>
                        ))}
                    </select>
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="all">Tất cả loại</option>
                        {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="all">Tất cả mức độ</option>
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                    </select>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                {reports.length === 0 ? (
                    <div className="text-sm text-gray-500">{loading ? 'Đang tải...' : 'Chưa có báo cáo nào.'}</div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((r) => (
                            <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                {r.status === 'resolved' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button className="text-left text-sm font-medium text-gray-900 truncate hover:underline" onClick={() => { setSelectedId(r.id); openDetail(r.id) }}>{r.title}</button>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_LABEL[r.status].cls}`}>{STATUS_LABEL[r.status].text}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{INCIDENT_TYPE_LABELS[r.type] || r.type}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_LABEL[(r as any).priority || 'medium']?.cls}`}>{PRIORITY_LABEL[(r as any).priority || 'medium']?.text}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line break-words">{r.content}</p>
                                    {r.imageUrl && (
                                        <div className="mt-2">
                                            <a href={r.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Xem ảnh đính kèm</a>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                                        <div className="flex gap-2">
                                            {r.status === 'pending' && (
                                                <>
                                                    <button className="btn-secondary px-3 py-1 text-xs" disabled={actionLoading} onClick={() => setStatusAction(r.id, 'in_progress')}>Tiếp nhận</button>
                                                    <button className="btn-danger px-3 py-1 text-xs" disabled={actionLoading} onClick={() => setStatusAction(r.id, 'rejected')}>Hủy</button>
                                                </>
                                            )}
                                            {r.status === 'in_progress' && (
                                                <>
                                                    <button className="btn-success px-3 py-1 text-xs" disabled={actionLoading} onClick={() => setStatusAction(r.id, 'resolved')}>Đã xử lý</button>
                                                    <button className="btn-danger px-3 py-1 text-xs" disabled={actionLoading} onClick={() => setStatusAction(r.id, 'rejected')}>Hủy</button>
                                                </>
                                            )}
                                            {(r.status === 'resolved' || r.status === 'rejected') && (
                                                <button className="btn-secondary px-3 py-1 text-xs" onClick={() => openDetail(r.id)}>Chi tiết</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedId && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h4 className="text-lg font-semibold">Chi tiết sự cố</h4>
                            <button className="p-2 hover:bg-gray-100 rounded" onClick={closeDetail} aria-label="Đóng"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            {detailLoading && <div className="text-sm text-gray-500">Đang tải...</div>}
                            {detail && (
                                <>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">{detail.title}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_LABEL[detail.status]?.cls || ''}`}>{STATUS_LABEL[detail.status]?.text || detail.status}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{INCIDENT_TYPE_LABELS[detail.type] || detail.type}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_LABEL[(detail as any).priority || 'medium']?.cls}`}>{PRIORITY_LABEL[(detail as any).priority || 'medium']?.text}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-gray-500">Tài xế:</span> <span className="text-gray-900">{detail.sender?.fullName || '-'}</span></div>
                                        <div><span className="text-gray-500">Biển số:</span> <span className="text-gray-900">{detail.trip?.bus?.licensePlate || '-'}</span></div>
                                        <div><span className="text-gray-500">Học sinh:</span> <span className="text-gray-900">{detail.student?.fullName || '-'}</span></div>
                                        <div><span className="text-gray-500">Tuyến:</span> <span className="text-gray-900">{detail.trip?.route?.name || '-'}</span></div>
                                        <div><span className="text-gray-500">Tạo lúc:</span> <span className="text-gray-900">{new Date(detail.createdAt).toLocaleString()}</span></div>
                                        {detail['updatedAt'] && <div><span className="text-gray-500">Cập nhật:</span> <span className="text-gray-900">{new Date(detail['updatedAt'] as any).toLocaleString()}</span></div>}
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-sm mb-1">Mô tả</div>
                                        <div className="text-gray-800 text-sm whitespace-pre-line">{detail.content}</div>
                                    </div>
                                    {detail.imageUrl && (
                                        <div>
                                            <div className="text-gray-500 text-sm mb-1">Bằng chứng</div>
                                            <a className="text-blue-600 text-sm hover:underline" href={detail.imageUrl} target="_blank" rel="noreferrer">Xem ảnh đính kèm</a>
                                        </div>
                                    )}
                                    {detail.status === 'in_progress' && (
                                        <div>
                                            <div className="text-gray-500 text-sm mb-1">Ghi chú giải quyết</div>
                                            <textarea
                                                value={resolutionNote}
                                                onChange={(e) => setResolutionNote(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-gray-500 text-sm mb-1">Mức độ ưu tiên</div>
                                        <select
                                            value={(detail as any)?.priority || 'medium'}
                                            onChange={async (e) => {
                                                const next = e.target.value as 'low' | 'medium' | 'high'
                                                try {
                                                    const updated = await updateReport(detail!.id, { priority: next } as any)
                                                    setDetail(updated)
                                                    setReports(prev => prev.map(r => r.id === updated.id ? { ...r, priority: (updated as any).priority } as any : r))
                                                } catch (err: any) { alert(err?.message || 'Không cập nhật được mức độ') }
                                            }}
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="low">Thấp</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="high">Cao</option>
                                        </select>
                                    </div>
                                    {showNotify && (
                                        <div>
                                            <div className="text-gray-500 text-sm mb-1">Gửi thông báo</div>
                                            <input
                                                type="text"
                                                placeholder="Tiêu đề"
                                                value={notifyTitle}
                                                onChange={(e) => setNotifyTitle(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                                            />
                                            <textarea
                                                placeholder="Nội dung"
                                                value={notifyContent}
                                                onChange={(e) => setNotifyContent(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                                                rows={3}
                                            />
                                            <div className="flex gap-2 mb-2">
                                                <select
                                                    value={notifyPriority}
                                                    onChange={(e) => setNotifyPriority(e.target.value as any)}
                                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                >
                                                    <option value="normal">Bình thường</option>
                                                    <option value="important">Quan trọng</option>
                                                    <option value="urgent">Khẩn cấp</option>
                                                </select>
                                                <select
                                                    value={notifyTarget}
                                                    onChange={(e) => setNotifyTarget(e.target.value as any)}
                                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                >
                                                    <option value="parents">Phụ huynh</option>
                                                    <option value="drivers">Tài xế</option>
                                                </select>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                disabled={notifyLoading}
                                                onClick={handleSendNotify}
                                            >
                                                {notifyLoading ? 'Đang gửi...' : 'Gửi thông báo'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="p-4 border-t flex flex-wrap gap-2 justify-end">
                            {detail && detail.status === 'pending' && (
                                <>
                                    <button className="btn-secondary" disabled={actionLoading} onClick={() => setStatusAction(detail.id, 'in_progress')}>Tiếp nhận</button>
                                    <button className="btn-danger" disabled={actionLoading} onClick={() => setStatusAction(detail.id, 'rejected')}>Hủy</button>
                                </>
                            )}
                            {detail && detail.status === 'in_progress' && (
                                <>
                                    <button className="btn-success" disabled={actionLoading} onClick={() => setStatusAction(detail.id, 'resolved')}>Đã xử lý</button>
                                    <button className="btn-danger" disabled={actionLoading} onClick={() => setStatusAction(detail.id, 'rejected')}>Hủy</button>
                                </>
                            )}
                            {detail && (
                                <button className="btn-secondary" onClick={() => setShowNotify(!showNotify)}>
                                    {showNotify ? 'Đóng thông báo' : 'Gửi thông báo'}
                                </button>
                            )}
                            <button className="btn-secondary" onClick={closeDetail}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow">
                    {toast}
                </div>
            )}
        </div>
    )
}
