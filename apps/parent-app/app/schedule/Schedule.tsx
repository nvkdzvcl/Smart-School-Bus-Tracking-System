import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import WeeklySchedule from "../../components/schedule/WeeklySchedule.tsx"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Schedule" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <WeeklySchedule />
        {/* <AbsenceRequest /> */}
      </main>

      <BottomNav />
    </div>
  )
}
