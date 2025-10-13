import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { StudentProfile } from "@/components/student-profile"
import { AttendanceHistory } from "@/components/attendance-history"
import { EmergencyContacts } from "@/components/emergency-contacts"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Student Profile" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <StudentProfile />
        <AttendanceHistory />
        <EmergencyContacts />
      </main>

      <BottomNav />
    </div>
  )
}
