import { TopBar } from "../../components/TopBar"
import { BottomNav } from "../../components/BottomNav"
import { MessageList } from "../../components/MessageList"

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Messages" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto">
        <MessageList />
      </main>

      <BottomNav />
    </div>
  )
}
