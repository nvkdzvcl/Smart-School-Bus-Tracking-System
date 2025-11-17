import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import StudentProfile from "../../components/profile/StudentProfile.tsx"


export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Student Profile" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <StudentProfile />
        {/*<AttendanceHistory />*/}
        {/* <EmergencyContacts /> */}
      </main>

      <BottomNav />
    </div>
  )
}
