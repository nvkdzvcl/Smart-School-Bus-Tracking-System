import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BusFront, Phone, Lock } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('0933333333') // seeded manager phone
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = (import.meta as any).env?.VITE_DASHBOARD_API_URL || `${window.location.protocol}//${window.location.hostname}:3001/api`

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Đăng nhập thất bại')
      }
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      // Also store under the standardized key used by other apps
      localStorage.setItem('auth_token', data.access_token)
      navigate('/')
    } catch (e: any) {
      setError(e.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-gray-800 bg-gray-900 shadow-xl p-8 text-gray-100">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white">
          <BusFront className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-center text-3xl font-semibold text-white">SSB 1.0</h1>
        <p className="text-center text-gray-400 mt-2">Đăng nhập quản lý</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Số điện thoại</label>
            <div className="relative mt-1">
              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-gray-800/80 border border-gray-700 pl-10 pr-3 py-3 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0933333333"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Mật khẩu</label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-gray-800/80 border border-gray-700 pl-10 pr-3 py-3 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>

        <div className="mt-6 p-4 rounded-lg border border-gray-700 bg-gray-800/60 text-sm text-gray-300">
          <div className="font-medium mb-2">Tài khoản mẫu:</div>
          <ul className="space-y-1">
            <li>Quản lý: 0933333333</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
