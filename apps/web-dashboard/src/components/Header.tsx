import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, Bell } from 'lucide-react'
import { getDriverSocket } from '../lib/socket'

export default function Header() {
  const navigate = useNavigate()
  // User Info State (from HEAD)
  const [userName, setUserName] = useState('Quản lý')
  const [userRole, setUserRole] = useState('')

  // Notification State (from Remote)
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<{ id: string; title: string; time: string }[]>([])

  // Effect for User Info (from HEAD)
  useEffect(() => {
    const infoStr = localStorage.getItem('user_info')
    if (infoStr) {
      try {
        const user = JSON.parse(infoStr)
        if (user.name) setUserName(user.name)
        if (user.role) setUserRole(user.role === 'manager' ? 'Quản trị viên' : user.role)
      } catch (e) {
        console.error('Failed to parse user info', e)
      }
    }
  }, [])

  // Effect for Notifications (from Remote)
  useEffect(() => {
    const socket = getDriverSocket()
    const onCreated = (r: any) => {
      setCount((c) => c + 1)
      setItems((prev) => [{ id: r.id, title: r.title || 'Sự cố mới', time: new Date(r.createdAt || Date.now()).toLocaleTimeString() }, ...prev].slice(0, 5))
    }
    socket.on('report_created', onCreated)
    return () => { socket.off('report_created', onCreated) }
  }, [])

  const toggle = () => { setOpen((o) => !o); if (!open) setCount(0) }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            SSB 1.0 Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4 relative">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button aria-label="Thông báo" onClick={toggle} className={`relative p-2 rounded-lg hover:bg-gray-100 ${open ? 'bg-gray-100' : ''}`}>
              <Bell className="w-5 h-5 text-gray-700" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full border border-white">{count}</span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b font-semibold text-gray-900">Thông báo</div>
                <div className="max-h-60 overflow-auto">
                  {items.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">Không có thông báo mới</div>
                  ) : (
                    items.map((it) => (
                      <div key={it.id} className="p-3 hover:bg-gray-50">
                        <div className="text-sm text-gray-900 truncate">{it.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{it.time}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t">
                  <button onClick={() => { setOpen(false); navigate('/alerts') }} className="w-full text-sm text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-md">Xem tất cả sự cố</button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{userName}</span>
              {userRole && <span className="text-xs text-gray-500">{userRole}</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}