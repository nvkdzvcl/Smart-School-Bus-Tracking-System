import TopBar from "../../components/TopBar"
import BottomNav from "../../components/BottomNav"
import SettingsForm from "../../components/SettingsForm"

export default function Settings() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Settings" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <SettingsForm />
      </main>

      <BottomNav />
    </div>
  )
}
