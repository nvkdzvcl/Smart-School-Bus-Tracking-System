import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import MessagesList from "../../components/unecessary/MessagesList.tsx"
import {useAuth} from "../../lib/auth/useAuth.ts";

export default function MessagesPage() {
    const { parentID } = useAuth()

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Messages" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto">
        <MessagesList parentID={parentID} />
      </main>

      <BottomNav />
    </div>
  )
}
