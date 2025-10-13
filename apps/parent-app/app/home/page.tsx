import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { BusStatusCard } from "@/components/bus-status-card"
import { StudentCard } from "@/components/student-card"
import { QuickActions } from "@/components/quick-actions"
import { UpcomingTrips } from "@/components/upcoming-trips"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Home" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <StudentCard />
        <BusStatusCard />
        <QuickActions />
        <UpcomingTrips />
      </main>

      <BottomNav />
    </div>
  )
}
