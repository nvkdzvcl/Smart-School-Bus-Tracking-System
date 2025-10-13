import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { User } from "../types"
import type { Permission } from "./permissions"
import { ROLE_PERMISSIONS } from "./permissions"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem("ssb_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - in production, this would call an API
    const foundUser = MOCK_USERS.find((u) => u.email === email)
    if (foundUser) {
      const userWithLogin = { ...foundUser, lastLogin: new Date().toISOString() }
      setUser(userWithLogin)
      localStorage.setItem("ssb_user", JSON.stringify(userWithLogin))
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ssb_user")
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
