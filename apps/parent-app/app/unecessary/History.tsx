import Header from "../layout/components/Header.tsx"
import BottomNav from "../layout/components/BottomNav.tsx"
import TripHistory from "../../components/unecessary/TripHistory.tsx"
import HistoryFilters from "../../components/unecessary/HistoryFilters.tsx"

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Trip History" showBack showNotifications notificationCount={2} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <HistoryFilters />
        <TripHistory />
      </main>

      <BottomNav />
    </div>
  )
}
