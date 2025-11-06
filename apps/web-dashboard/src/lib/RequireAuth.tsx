import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthenticated } from './auth'

export function RequireAuth() {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}
