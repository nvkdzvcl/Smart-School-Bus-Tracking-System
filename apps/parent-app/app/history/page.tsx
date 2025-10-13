import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { TripHistory } from "@/components/trip-history"
import { HistoryFilters } from "@/components/history-filters"

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Trip History" showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <HistoryFilters />
        <TripHistory />
      </main>

      <BottomNav />
    </div>
  )
}
