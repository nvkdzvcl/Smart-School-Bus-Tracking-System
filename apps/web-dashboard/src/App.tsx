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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/buses" element={<BusManagement />} />
        <Route path="/drivers" element={<DriverManagement />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/routes" element={<RouteManagement />} />
        <Route path="/tracking" element={<RealTimeTracking />} />
        <Route path="/schedules" element={<ScheduleManagement />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Layout>
  )
}

export default App