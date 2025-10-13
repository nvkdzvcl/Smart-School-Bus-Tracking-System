import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { AlertList } from "@/components/alert-list"

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
