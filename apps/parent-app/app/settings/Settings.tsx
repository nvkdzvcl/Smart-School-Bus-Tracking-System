import Header from "../layout/components/Header.tsx"
import BottomNav from "../layout/components/BottomNav.tsx"
import SettingsPage from "./components/SettingsPage.tsx"

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
