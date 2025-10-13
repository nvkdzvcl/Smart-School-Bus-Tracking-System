import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { MessageList } from "@/components/message-list"

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
