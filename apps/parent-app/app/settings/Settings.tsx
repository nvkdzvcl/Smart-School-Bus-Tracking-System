import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import SettingsPage from "../../components/settings/SettingsPage.tsx"

export default function Settings() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Settings" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <SettingsPage />
      </main>

      <BottomNav />
    </div>
  )
}
