import {useNavigate} from "react-router-dom";
import {useState} from "react";
import { AuthContext } from "./AuthContext"

function getAuthData() {
    const authenticated = localStorage.getItem("parent_authenticated");
    const token = localStorage.getItem("access_token");
    const myID = localStorage.getItem("parent_id");

    if (authenticated && token && myID) {
        return { token, parentID: myID };
    }
    return null;
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate()
    const [authData, setAuthData] = useState(() => getAuthData())

    const login = (token: string, parentID: string) => {
        localStorage.setItem("parent_authenticated", "true");
        localStorage.setItem("access_token", token);
        localStorage.setItem("parent_id", parentID);
        setAuthData({ token, parentID });
        navigate("/");
    };

    const logout = () => {
        localStorage.removeItem("parent_authenticated");
        localStorage.removeItem("access_token");
        localStorage.removeItem("parent_id");
        setAuthData(null);
        navigate("/login");
    };

    const value = { token: authData?.token ?? null, parentID: authData?.parentID ?? null, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}