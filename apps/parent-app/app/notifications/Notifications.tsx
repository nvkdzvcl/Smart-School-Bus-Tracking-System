import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import NotificationsList from "../../components/notifications/NotificationsList.tsx";
import {useAuth} from "../../lib/auth/useAuth.ts";

export default function NotificationsPage() {
    const { parentID } = useAuth()

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Messages" showBack showNotifications notificationCount={2} />

            <main className="max-w-2xl mx-auto">
                <NotificationsList parentID={parentID} />
            </main>

            <BottomNav />
        </div>
    )
}
