// src/main.tsx
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

// Layout và style toàn cục
import RootLayout from "../app/Layout"
import "../app/globals.css"

// Auth
import { AuthProvider } from "../lib/auth/Context"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"

// Pages
import Home from "../app/Home"
import Login from "../app/login/Login"
import Dashboard from "../app/dashboard/Dashboard"
import Assignments from "../app/assignments/Assignments"
// import Students from "../app/students/Students"
import Drivers from "../app/drivers/Drivers"
// import Incidents from "../app/incidents/Incidents"
import Messages from "../app/messages/Messages"
import Schedules from "../app/schedules/Schedules"
// import Settings from "../app/settings/Settings"
// import Reports from "../app/reports/Reports"
// import AuditLogs from "../app/audit-logs/AuditLogs"
// import Attendance from "../app/attendance/Attendance"
import Tracking from "../app/tracking/Tracking"
// import Users from "../app/users/Users"
import Vehicles from "../app/vehicles/Vehicles"
// import Stops from "../app/stops/Stops"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes (chỉ truy cập khi đã đăng nhập) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Home />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Dashboard />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Assignments />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/students"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Students />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/drivers"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Drivers />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Incidents />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Messages />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Schedules />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Settings />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Reports />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <AuditLogs />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
          {/* <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Attendance />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Tracking />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/users"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Users />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Vehicles />
                </RootLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/stops"
            element={
              <ProtectedRoute>
                <RootLayout>
                  <Stops />
                </RootLayout>
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
