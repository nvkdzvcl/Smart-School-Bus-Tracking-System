import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Bus,
  Users,
  GraduationCap,
  Route,
  MapPin,
  Calendar,
  MessageCircle,
  AlertTriangle,
  LogOut
} from 'lucide-react'
import { logout } from '../lib/auth'

const menuItems = [
  {
    path: '/',
    icon: LayoutDashboard,
    label: 'Tổng quan',
    exact: true
  },
  {
    path: '/buses',
    icon: Bus,
    label: 'Quản lý Xe buýt'
  },
  {
    path: '/drivers',
    icon: Users,
    label: 'Quản lý Tài xế'
  },
  {
    path: '/students',
    icon: GraduationCap,
    label: 'Quản lý Học sinh'
  },
  {
    path: '/routes',
    icon: Route,
    label: 'Quản lý Tuyến đường'
  },
  {
    path: '/tracking',
    icon: MapPin,
    label: 'Theo dõi Thời gian thực'
  },
  {
    path: '/schedules',
    icon: Calendar,
    label: 'Quản lý Lịch trình'
  },
  {
    path: '/alerts',
    icon: AlertTriangle,
    label: 'Sự cố'
  },
  {
    path: '/messages',
    icon: MessageCircle,
    label: 'Tin nhắn'
  }
]

export default function Sidebar() {
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }
  return (
    <div className="bg-white w-64 shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">SSB 1.0</h2>
            <p className="text-xs text-gray-500">Smart School Bus</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <button onClick={handleLogout} className="sidebar-item w-full text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="w-5 h-5 mr-3" />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}