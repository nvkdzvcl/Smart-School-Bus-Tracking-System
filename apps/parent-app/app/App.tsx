// Pages
import Home from "../app/home/Home"
import Login from "../app/login/Login"
import History from "../app/history/History"
import Profile from "../app/profile/Profile"
import Schedule from "../app/schedule/Schedule"
import Tracking from "../app/tracking/Tracking"
import Settings from "../app/settings/Settings"
import Notifications from "../app/notifications/Notifications.tsx";
import {Route, Routes} from "react-router-dom";
import RootLayout from "./layout.tsx";
import {PrivateRoute} from "../components/auth/PrivateRoute.tsx";

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Private routes (chỉ truy cập khi đã đăng nhập) */}
            <Route element={
                <PrivateRoute>
                    <RootLayout />
                </PrivateRoute>
            }>
                <Route path="/" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/tracking" element={<Tracking />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
            </Route>
        </Routes>
    )
}