import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import LiveMap from "../../components/tracking/LiveMap.tsx"
import BusInfoPanel from "../../components/tracking/BusInfoPanel.tsx"

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Live Tracking" showBack showNotifications notificationCount={2} />

      <main className="relative h-[calc(100vh-8rem)]">
        <LiveMap />
        <BusInfoPanel />
      </main>

      <BottomNav />
    </div>
  )
}
