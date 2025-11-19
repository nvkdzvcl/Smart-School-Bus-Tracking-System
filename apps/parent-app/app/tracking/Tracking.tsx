import Header from "../layout/components/Header.tsx"
import BottomNav from "../layout/components/BottomNav.tsx"
import LiveMap from "./components/LiveMap.tsx"
import TripInfoPanel from "./components/TripInfoPanel.tsx"

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Live Tracking" showBack showNotifications notificationCount={2} />

      <main className="relative h-[calc(100vh-8rem)]">
        <LiveMap />
        <TripInfoPanel />
      </main>

      <BottomNav />
    </div>
  )
}
