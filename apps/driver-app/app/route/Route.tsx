import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"

interface Stop {
  id: number
  name: string
  address: string
  students: number
  status: "pending" | "current" | "completed"
  eta: string
  lat: number
  lng: number
}

export default function RoutePage() {
  const navigate = useNavigate()
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [tripStatus, setTripStatus] = useState<"not-started" | "active" | "paused">("not-started")
  const [currentStopIndex, setCurrentStopIndex] = useState(0)

  const [stops] = useState<Stop[]>([
    {
      id: 1,
      name: "Điểm 1 - Nguyễn Văn A",
      address: "123 Đường Lê Lợi, Quận 1",
      students: 3,
      status: "current",
      eta: "06:35",
      lat: 10.7769,
      lng: 106.7009,
    },
    {
      id: 2,
      name: "Điểm 2 - Trần Thị B",
      address: "456 Đường Nguyễn Huệ, Quận 1",
      students: 2,
      status: "pending",
      eta: "06:42",
      lat: 10.7756,
      lng: 106.7019,
    },
    {
      id: 3,
      name: "Điểm 3 - Lê Văn C",
      address: "789 Đường Pasteur, Quận 1",
      students: 4,
      status: "pending",
      eta: "06:50",
      lat: 10.7743,
      lng: 106.6978,
    },
    {
      id: 4,
      name: "Điểm 4 - Phạm Thị D",
      address: "321 Đường Hai Bà Trưng, Quận 1",
      students: 3,
      status: "pending",
      eta: "06:58",
      lat: 10.7721,
      lng: 106.6989,
    },
    {
      id: 5,
      name: "Trường Tiểu học ABC",
      address: "555 Đường Trần Hưng Đạo, Quận 1",
      students: 0,
      status: "pending",
      eta: "07:10",
      lat: 10.7698,
      lng: 106.6956,
    },
  ])

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      navigate("/")
      return
    }

    const speedInterval = setInterval(() => {
      if (tripStatus === "active") {
        setCurrentSpeed(Math.floor(Math.random() * 40) + 20)
      } else {
        setCurrentSpeed(0)
      }
    }, 2000)

    return () => clearInterval(speedInterval)
  }, [navigate, tripStatus])

  const handleStartTrip = () => setTripStatus("active")
  const handlePauseTrip = () => setTripStatus("paused")
  const handleResumeTrip = () => setTripStatus("active")

  const handleNextStop = () => {
    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1)
    }
  }

  const handleNavigate = () => {
    const currentStop = stops[currentStopIndex]
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${currentStop.lat},${currentStop.lng}`,
      "_blank"
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-foreground hover:bg-muted/70"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Lộ trình</h1>
                <p className="text-xs text-muted-foreground">Tuyến A - Quận 1</p>
              </div>
            </div>
            <Badge
              className={
                (
                  tripStatus === "active"
                    ? "bg-primary text-primary-foreground"
                    : tripStatus === "paused"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-secondary-foreground border border-border/50"
                ) + " rounded-full px-3 py-0.5"
              }
            >
              {tripStatus === "active" ? "Đang chạy" : tripStatus === "paused" ? "Tạm dừng" : "Chưa bắt đầu"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Map Placeholder */}
        <Card className="border-border/50 overflow-hidden rounded-lg">
          <div className="relative h-64 bg-gradient-to-br from-secondary to-accent/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <svg className="w-16 h-16 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Bản đồ GPS</p>
                <p className="text-xs text-muted-foreground">Vị trí hiện tại: Quận 1, TP.HCM</p>
              </div>
            </div>

            {/* Speed indicator */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary tabular-nums">{currentSpeed}</div>
                <div className="text-xs text-muted-foreground">km/h</div>
              </div>
            </div>

            {/* Current location marker */}
            {tripStatus === "active" && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                  <div className="relative w-4 h-4 bg-primary rounded-full border-2 border-background" />
                </div>
              </div>
            )}
          </div>

          {/* Trip Controls */}
          <CardContent className="p-4 bg-card">
            <div className="flex gap-2">
              {tripStatus === "not-started" && (
                <Button
                  onClick={handleStartTrip}
                  className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bắt đầu chuyến
                </Button>
              )}

              {tripStatus === "active" && (
                <>
                  <Button
                    onClick={handlePauseTrip}
                    variant="outline"
                    className="flex-1 border-border text-foreground hover:bg-muted/70 bg-transparent rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Tạm dừng
                  </Button>
                  <Button
                    onClick={handleNavigate}
                    className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    Chỉ đường
                  </Button>
                </>
              )}

              {tripStatus === "paused" && (
                <Button
                  onClick={handleResumeTrip}
                  className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tiếp tục
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Stop Info */}
        <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 rounded-lg">
          <CardContent className="px-4 pt-6 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary text-primary-foreground rounded-lg">Điểm hiện tại</Badge>
                  <span className="text-xs text-muted-foreground">ETA: {stops[currentStopIndex].eta}</span>
                </div>
                <h3 className="font-semibold text-foreground">{stops[currentStopIndex].name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{stops[currentStopIndex].address}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{stops[currentStopIndex].students} học sinh</span>
              </div>
              <Button
                onClick={handleNextStop}
                size="sm"
                disabled={currentStopIndex === stops.length - 1}
                className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors duration-200"
              >
                Điểm tiếp theo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Route Progress */}
        <Card className="border-border/50 rounded-lg">
          <CardContent className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Tiến độ tuyến</h3>
              <span className="text-sm text-muted-foreground">
                {currentStopIndex + 1}/{stops.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index < currentStopIndex
                        ? "bg-primary border-primary text-primary-foreground"
                        : index === currentStopIndex
                          ? "bg-accent border-accent text-accent-foreground"
                          : "bg-muted border-border text-muted-foreground"
                        }`}
                    >
                      {index < currentStopIndex ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < stops.length - 1 && (
                      <div className={`w-0.5 h-8 ${index < currentStopIndex ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${index === currentStopIndex ? "text-foreground" : "text-muted-foreground"
                          }`}
                      >
                        {stop.name}
                      </p>
                      <span className="text-xs text-muted-foreground">{stop.eta}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{stop.address}</p>
                    {stop.students > 0 && <p className="text-xs text-muted-foreground mt-1">{stop.students} học sinh</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main >

      <MobileNav />
    </div >
  )
}
