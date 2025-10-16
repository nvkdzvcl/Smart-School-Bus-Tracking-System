import { createContext } from "react"
import type { User } from "../Types"
import type { Permission } from "./Permissions"

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
