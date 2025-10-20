import { TopBar } from "../../components/TopBar"
import { BottomNav } from "../../components/BottomNav"
import { TripHistory } from "../../components/TripHistory"
import { HistoryFilters } from "../../components/HistoryFilters"

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
