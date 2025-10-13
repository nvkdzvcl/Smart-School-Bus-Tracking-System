import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { LiveMap } from "@/components/live-map"
import { BusInfoPanel } from "@/components/bus-info-panel"

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
