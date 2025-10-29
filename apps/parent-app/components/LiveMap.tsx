import React, { useRef, useState } from "react"
import { Button } from "../components/ui/Button"
import { Navigation, RefreshCw } from "lucide-react"

export default function LiveMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // const handleRecenter = () => {
  //   Recenter map logic
  // }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full bg-muted">
        {/* Placeholder map with route visualization */}
        <div className="w-full h-full relative overflow-hidden">
          <img
            src="/street-map-with-route-and-bus-location-marker.jpg"
            alt="Live bus tracking map"
            className="w-full h-full object-cover"
          />

          {/* Bus marker overlay */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>

          {/* Pickup point marker */}
          <div className="absolute top-2/3 right-1/4">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-accent-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="w-10 h-10 bg-card shadow-lg"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
        {/* <Button size="icon" variant="secondary" className="w-10 h-10 bg-card shadow-lg" onClick={handleRecenter}>
          <Navigation className="w-5 h-5" />
        </Button> */}
      </div>

      {/* ETA Banner */}
      <div className="absolute top-4 left-4 right-20">
        <div className="bg-accent text-accent-foreground px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-90">Estimated Arrival</p>
              <p className="text-lg font-bold">5 minutes</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">Distance</p>
              <p className="text-sm font-semibold">1.2 km</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
