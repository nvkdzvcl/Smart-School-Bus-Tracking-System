import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Layout + global styles
import RootLayout from "../app/layout" // <-- (Xem Sửa 2)
import "../app/globals.css"

// Pages
import Home from "../app/Home"
import Dashboard from "../app/dashboard/Dashboard"
import History from "../app/history/History"
import Incidents from "../app/incidents/Incidents"
import Messages from "../app/messages/Messages"
import RoutePage from "../app/route/Route"
import Settings from "../app/settings/Settings"
import Students from "../app/students/Students"

const rootEl = document.getElementById("root") as HTMLElement | null
if (!rootEl) throw new Error('Root element with id "root" not found in index.html')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public route: Login/Home */}
        <Route path="/" element={<Home />} />

        {/* --- SỬA LẠI TỪ ĐÂY --- */}
        {/* 1. Tạo 1 Route cha cho RootLayout */}
        <Route element={<RootLayout />}>
          {/* 2. Đặt các trang con vào bên trong */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/route" element={<RoutePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/students" element={<Students />} />
        </Route>
        {/* --- HẾT PHẦN SỬA --- */}

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)