import Header from "../../components/layout/Header.tsx"
import BottomNav from "../../components/layout/BottomNav.tsx"
import TripHistory from "../../components/TripHistory"
import HistoryFilters from "../../components/schedule/HistoryFilters.tsx"

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
