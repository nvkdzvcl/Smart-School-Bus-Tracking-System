import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import BusStatusCard from "../../components/home/BusStatusCard.tsx"
import StudentCard from "../../components/home/StudentCard.tsx"

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Home" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <StudentCard />
        <BusStatusCard />
        {/* <QuickActions /> */}
        {/* <UpcomingTrips /> */}
      </main>

      <BottomNav />
    </div>
  )
}
