import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Layout và style toàn cục
import RootLayout from "../app/layout"
import "../app/globals.css"

// Pages
import Home from "../app/home/Home"
import Login from "../app/login/Login"
import History from "../app/history/History"
import Messages from "../app/messages/Messages"
import Profile from "../app/profile/Profile"
import Schedule from "../app/schedule/Schedule"
import Tracking from "../app/tracking/Tracking"
import Settings from "../app/settings/Settings"

const rootElement = document.getElementById("root") as HTMLElement | null
if(!rootElement) throw new Error('Root element with id "root" not found in index.html')

ReactDOM.createRoot(rootElement).render(
    <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />

                {/* Private routes (chỉ truy cập khi đã đăng nhập) */}
                <Route element={<RootLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/tracking" element={<Tracking />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
    </BrowserRouter>
)