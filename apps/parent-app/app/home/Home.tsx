import Header from "../layout/components/Header.tsx"
import BottomNav from "../layout/components/BottomNav.tsx"
import TripStatusCard from "./components/TripStatusCard.tsx"
import StudentCard from "./components/StudentCard.tsx"

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Home" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <StudentCard />
        <TripStatusCard />
        {/* <QuickActions /> */}
        {/* <UpcomingTrips /> */}
      </main>

      <BottomNav />
    </div>
  )
}
