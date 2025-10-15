import { createContext } from "react"
import type { User } from "../types"
import type { Permission } from "./permissions"

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
