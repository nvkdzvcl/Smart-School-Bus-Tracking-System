import {createContext} from "react";

interface AuthContextType {
    token: string | null
    parentID: string | null
    login: (token: string, parentID: string) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
