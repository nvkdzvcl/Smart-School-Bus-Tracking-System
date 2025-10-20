import { TopBar } from "../../components/TopBar"
import { BottomNav } from "../../components/BottomNav"
import { BusStatusCard } from "../../components/BusStatusCard"
import { StudentCard } from "../../components/StudentCard"
import { QuickActions } from "../../components/QuickActions"
import { UpcomingTrips } from "../../components/UpcomingTrips"

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
