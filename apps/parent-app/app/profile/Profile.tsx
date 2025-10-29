import TopBar from "../../components/TopBar"
import BottomNav from "../../components/BottomNav"
import StudentProfile from "../../components/StudentProfile"
import AttendanceHistory from "../../components/AttendanceHistory"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Student Profile" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <StudentProfile />
        <AttendanceHistory />
        {/* <EmergencyContacts /> */}
      </main>

      <BottomNav />
    </div>
  )
}
