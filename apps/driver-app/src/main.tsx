import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Layout + global styles
import RootLayout from "../app/layout"
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

                {/* Protected routes */}
                <Route path="/dashboard" element={<RootLayout><Dashboard /></RootLayout>} />
                <Route path="/history" element={<RootLayout><History /></RootLayout>} />
                <Route path="/incidents" element={<RootLayout><Incidents /></RootLayout>} />
                <Route path="/messages" element={<RootLayout><Messages /></RootLayout>} />
                <Route path="/route" element={<RootLayout><RoutePage /></RootLayout>} />
                <Route path="/settings" element={<RootLayout><Settings /></RootLayout>} />
                <Route path="/students" element={<RootLayout><Students /></RootLayout>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
