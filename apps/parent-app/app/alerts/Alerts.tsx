import TopBar from "../../components/TopBar"
import BottomNav from "../../components/BottomNav"
import AlertList from "../../components/AlertList"

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Alerts & Incidents" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4">
        <AlertList />
      </main>

      <BottomNav />
    </div>
  )
}
