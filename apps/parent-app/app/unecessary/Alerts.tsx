import Header from "../layout/components/Header.tsx"
import BottomNav from "../layout/components/BottomNav.tsx"
import AlertList from "../../components/unecessary/AlertList.tsx"

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Alerts & Incidents" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4">
        <AlertList />
      </main>

      <BottomNav />
    </div>
  )
}
