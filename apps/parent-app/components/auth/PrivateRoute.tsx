import {useAuth} from "../../lib/auth/useAuth.ts";
import {Navigate, useLocation} from "react-router-dom";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuth()
    const location = useLocation()

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <>{children}</>
}