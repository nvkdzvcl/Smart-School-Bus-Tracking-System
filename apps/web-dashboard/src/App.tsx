import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BusManagement from './pages/BusManagement'
import DriverManagement from './pages/DriverManagement'
import StudentManagement from './pages/StudentManagement'
import RouteManagement from './pages/RouteManagement'
import RealTimeTracking from './pages/RealTimeTracking'
import ScheduleManagement from './pages/ScheduleManagement'
import Messages from './pages/Messages'
import Login from './pages/Login'
import { RequireAuth } from './lib/RequireAuth'
import Alerts from './pages/Alerts'
import ParentManagement from './pages/ParentManagement'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Private routes */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buses" element={<BusManagement />} />
          <Route path="/drivers" element={<DriverManagement />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/parents" element={<ParentManagement />} />
          <Route path="/routes" element={<RouteManagement />} />
          <Route path="/tracking" element={<RealTimeTracking />} />
          <Route path="/schedules" element={<ScheduleManagement />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/messages" element={<Messages />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App