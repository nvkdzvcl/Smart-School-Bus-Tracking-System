import TopBar from "../../components/TopBar"
import BottomNav from "../../components/BottomNav"
import LiveMap from "../../components/LiveMap"
import BusInfoPanel from "../../components/BusInfoPanel"

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Live Tracking" showBack showNotifications notificationCount={2} />

      <main className="relative h-[calc(100vh-8rem)]">
        <LiveMap />
        <BusInfoPanel />
      </main>

      <BottomNav />
    </div>
  )
}
