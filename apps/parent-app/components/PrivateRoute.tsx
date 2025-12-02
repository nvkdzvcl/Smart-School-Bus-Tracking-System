import { Navigate } from "react-router-dom"

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token")
  if (!token) {
    // chưa đăng nhập thì chuyển về trang login
    return <Navigate to="/login" replace />
  }
  return children
}
