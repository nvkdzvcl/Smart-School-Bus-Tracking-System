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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes (chỉ truy cập khi đã đăng nhập) */}
                <Route
                    path="/"
                    element={
                            <RootLayout>
                                <Home />
                            </RootLayout>
                    }
                />
                <Route
                    path="/history"
                    element={
                            <RootLayout>
                                <History />
                            </RootLayout>
                    }
                />
                <Route
                    path="/profile"
                    element={
                            <RootLayout>
                                <Profile />
                            </RootLayout>
                    }
                />
                <Route
                    path="/schedule"
                    element={
                            <RootLayout>
                                <Schedule />
                            </RootLayout>
                    }
                />
                <Route
                    path="/messages"
                    element={
                            <RootLayout>
                                <Messages />
                            </RootLayout>
                    }
                />
                <Route
                    path="/tracking"
                    element={
                            <RootLayout>
                                <Tracking />
                            </RootLayout>
                    }
                />
                <Route
                    path="/settings"
                    element={
                            <RootLayout>
                                <Settings />
                            </RootLayout>
                    }
                />
            </Routes>
    </BrowserRouter>
)