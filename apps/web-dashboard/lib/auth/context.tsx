import { useState, useEffect, type ReactNode } from "react"
import type { User } from "../Types"
import type { Permission } from "./Permissions"
import { ROLE_PERMISSIONS } from "./Permissions"
import { AuthContext } from "./AuthContext"

// Mock users cho demo SPA
const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@ssb.vn",
    role: "admin",
    permissions: ROLE_PERMISSIONS.admin,
    avatar: "/admin-interface.png",
  },
  {
    id: "u2",
    name: "Điều phối viên",
    email: "dispatcher@ssb.vn",
    role: "dispatcher",
    permissions: ROLE_PERMISSIONS.dispatcher,
    avatar: "/emergency-dispatcher.png",
  },
  {
    id: "u3",
    name: "Quản lý tuyến",
    email: "route@ssb.vn",
    role: "route-manager",
    permissions: ROLE_PERMISSIONS["route-manager"],
    avatar: "/diverse-team-manager.png",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("ssb_user")
    if (storedUser) setUser(JSON.parse(storedUser))
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    void password // mark as used to satisfy noUnusedParameters
    const foundUser = MOCK_USERS.find((u) => u.email === email)
    if (!foundUser) throw new Error("Invalid credentials")
    const userWithLogin = { ...foundUser, lastLogin: new Date().toISOString() }
    setUser(userWithLogin)
    localStorage.setItem("ssb_user", JSON.stringify(userWithLogin))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ssb_user")
  }

  const hasPermission = (permission: Permission) => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  )
}
