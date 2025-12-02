import { Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header() {
  const [userName, setUserName] = useState('Quản lý')
  const [userRole, setUserRole] = useState('')

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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            SSB 1.0 Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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