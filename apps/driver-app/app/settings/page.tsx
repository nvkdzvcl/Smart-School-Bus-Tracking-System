"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const router = useRouter()
  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      router.push("/")
      return
    }

    const name = localStorage.getItem("driver_name") || ""
    const phone = localStorage.getItem("driver_phone") || ""
    setDriverName(name)
    setDriverPhone(phone)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("driver_authenticated")
    localStorage.removeItem("driver_name")
    localStorage.removeItem("driver_phone")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="text-foreground hover:bg-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Cài đặt</h1>
              <p className="text-xs text-muted-foreground">Quản lý tài khoản và ứng dụng</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Profile */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-2xl font-semibold text-secondary-foreground">{driverName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{driverName}</h3>
                <p className="text-sm text-muted-foreground">{driverPhone}</p>
                <p className="text-xs text-muted-foreground mt-1">Tài xế</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted bg-transparent"
              onClick={() => alert("Chỉnh sửa thông tin")}
            >
              Chỉnh sửa thông tin
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Thông báo</CardTitle>
            <CardDescription className="text-muted-foreground">Quản lý cài đặt thông báo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Âm thanh</Label>
                <p className="text-sm text-muted-foreground">Phát âm thanh khi có thông báo</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Rung</Label>
                <p className="text-sm text-muted-foreground">Rung khi có thông báo</p>
              </div>
              <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Giao diện</CardTitle>
            <CardDescription className="text-muted-foreground">Tùy chỉnh giao diện ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Chế độ tối</Label>
                <p className="text-sm text-muted-foreground">Sử dụng giao diện tối</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Hỗ trợ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent"
              onClick={() => router.push("/history")}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Lịch sử chuyến đi
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent"
              onClick={() => alert("Liên hệ hỗ trợ")}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Yêu cầu hỗ trợ kỹ thuật
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent"
              onClick={() => alert("Phản hồi")}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Gửi phản hồi
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-border/50">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <p>Driver App v1.0.0</p>
            <p className="mt-1">© 2025 School Bus Management System</p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Đăng xuất
        </Button>
      </main>

      <MobileNav />
    </div>
  )
}
