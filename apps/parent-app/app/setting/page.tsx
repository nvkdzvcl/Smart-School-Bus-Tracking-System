import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { AbsenceRequest } from "@/components/absence-request"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Schedule" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <WeeklySchedule />
        <AbsenceRequest />
      </main>

      <BottomNav />
    </div>
  )
}
