import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BusFront, Mail, Lock } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@ssb.vn')
  const [password, setPassword] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Fake auth: store a flag and redirect
    localStorage.setItem('ssb_auth', JSON.stringify({ email, ts: Date.now() }))
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-gray-800 bg-gray-900 shadow-xl p-8 text-gray-100">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white">
          <BusFront className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-center text-3xl font-semibold text-white">SSB 1.0</h1>
        <p className="text-center text-gray-400 mt-2">Hệ thống quản lý xe buýt trường học</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-gray-800/80 border border-gray-700 pl-10 pr-3 py-3 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="admin@ssb.vn"
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
          <button type="submit" className="btn-primary w-full">Đăng nhập</button>
        </form>

        <div className="mt-6 p-4 rounded-lg border border-gray-700 bg-gray-800/60 text-sm text-gray-300">
          <div className="font-medium mb-2">Tài khoản demo:</div>
          <ul className="space-y-1">
            <li>Admin: admin@ssb.vn</li>
            <li>Điều phối: dispatcher@ssb.vn</li>
            <li>Quản lý tuyến: route@ssb.vn</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
