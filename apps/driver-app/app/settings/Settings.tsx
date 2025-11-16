import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Label } from "../../components/ui/Label"
import { Switch } from "../../components/ui/Switch"
import { Input } from "../../components/ui/Input"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
const FEEDBACK_EMAIL = "support@schoolbus.app"
export default function SettingsPage() {
  const navigate = useNavigate()

  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [driverEmail, setDriverEmail] = useState("")

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  // popup edit
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // ===== 1. Load profile từ BE khi vào trang =====
  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    const token = localStorage.getItem("access_token")

    if (!authenticated || !token) {
      navigate("/")
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const { fullName, phone, email } = res.data

        setDriverName(fullName || "")
        setDriverPhone(phone || "")
        setDriverEmail(email || "")

        // lưu localStorage để chỗ khác dùng (dashboard, header…)
        localStorage.setItem("driver_name", fullName || "")
        localStorage.setItem("driver_phone", phone || "")
        localStorage.setItem("driver_email", email || "")
      } catch (err) {
        console.error("Lỗi khi load profile:", err)
        // nếu lỗi auth thì đá về login
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("driver_authenticated")
          navigate("/")
        }
      }
    }

    fetchProfile()

    // theme
    const savedTheme = localStorage.getItem("theme") // 'dark' | 'light'
    if (savedTheme) {
      const isDark = savedTheme === "dark"
      setDarkMode(isDark)
      document.documentElement.classList.toggle("dark", isDark)
    } else {
      document.documentElement.classList.toggle("dark", true)
    }
  }, [navigate])

  // sync dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  const handleLogout = () => {
    localStorage.removeItem("driver_authenticated")
    localStorage.removeItem("driver_name")
    localStorage.removeItem("driver_phone")
    localStorage.removeItem("driver_email")
    localStorage.removeItem("access_token")
    navigate("/")
  }

  // mở popup
  const handleOpenEdit = () => {
    setEditName(driverName)
    setEditPhone(driverPhone)
    setEditEmail(driverEmail)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setIsEditing(true)
  }

  // lưu thông tin + đổi mật khẩu (nếu có)
  const handleSaveProfile = async () => {
    const trimmedName = editName.trim()
    const trimmedPhone = editPhone.trim()
    const trimmedEmail = editEmail.trim()

    if (!trimmedName) {
      alert("Vui lòng nhập họ tên tài xế.")
      return
    }

    const wantChangePassword =
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0

    if (wantChangePassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.")
        return
      }
      if (newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự.")
        return
      }
      if (newPassword !== confirmPassword) {
        alert("Mật khẩu mới và xác nhận mật khẩu không khớp.")
        return
      }
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/")
      return
    }

    setIsSaving(true)
    try {
      // 1) Cập nhật profile
      const res = await axios.patch(
        `${API_URL}/profile/me`,
        {
          fullName: trimmedName,
          phone: trimmedPhone || undefined,
          email: trimmedEmail || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const { fullName, phone, email } = res.data
      setDriverName(fullName || "")
      setDriverPhone(phone || "")
      setDriverEmail(email || "")

      localStorage.setItem("driver_name", fullName || "")
      localStorage.setItem("driver_phone", phone || "")
      localStorage.setItem("driver_email", email || "")

      // 2) Nếu có đổi mật khẩu → call BE
      if (wantChangePassword) {
        await axios.patch(
          `${API_URL}/profile/change-password`,
          {
            currentPassword,
            newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        alert("Đổi mật khẩu thành công.")
      }

      setIsEditing(false)
    } catch (err: any) {
      console.error("Lỗi khi cập nhật thông tin/mật khẩu:", err)
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        alert(err.response.data.message)
      } else {
        alert("Không thể cập nhật thông tin. Vui lòng thử lại.")
      }
    } finally {
      setIsSaving(false)
    }
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
              onClick={() => navigate("/dashboard")}
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
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-2xl font-semibold text-secondary-foreground">
                  {driverName ? driverName.charAt(0) : "?"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {driverName || "Chưa có tên"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {driverPhone || "Chưa có số điện thoại"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {driverEmail || "Chưa có email"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tài xế</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
              onClick={handleOpenEdit}
            >
              Chỉnh sửa thông tin
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Thông báo</CardTitle>
            <CardDescription className="text-muted-foreground">
              Quản lý cài đặt thông báo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Âm thanh</Label>
                <p className="text-sm text-muted-foreground">
                  Phát âm thanh khi có thông báo
                </p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Rung</Label>
                <p className="text-sm text-muted-foreground">Rung khi có thông báo</p>
              </div>
              <Switch
                checked={vibrationEnabled}
                onCheckedChange={setVibrationEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Giao diện</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tùy chỉnh giao diện ứng dụng
            </CardDescription>
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
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Hỗ trợ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
              onClick={() => navigate("/history")}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch sử chuyến đi
            </Button>
<Button
  variant="outline"
  className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
  onClick={() => {
    window.location.href = "tel:099999999" // 👈 gọi số
  }}
>
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
  Yêu cầu hỗ trợ kỹ thuật
</Button>

<Button
  variant="outline"
  className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
  onClick={() => {
    const subject = encodeURIComponent("Phản hồi ứng dụng Driver App")
    const body = encodeURIComponent(
      `Chào đội kỹ thuật,\n\nMình muốn gửi phản hồi như sau:\n\n- Mô tả vấn đề / góp ý: \n- Thiết bị đang dùng: \n- Phiên bản ứng dụng: Driver App v1.0.0\n\nXin cảm ơn!`
    )

    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
  }}
>
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
  Gửi phản hồi
</Button>

          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-border/50 rounded-lg">
          <CardHeader>
  <CardContent
    className="py-1 text-center
               flex flex-col items-center justify-center gap-0.5"
  >
    <p className="">Driver App v1.0.0</p>
    <p className="">
      © 2025 School Bus Management System
    </p>
  </CardContent>
          </CardHeader>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent rounded-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </Button>
      </main>

      {/* Popup edit profile */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/30 items-end sm:items-center">
          <div className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border/60 shadow-lg">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Chỉnh sửa thông tin</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => !isSaving && setIsEditing(false)}
                className="hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-sm text-foreground">
                  Họ và tên
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nhập họ tên tài xế"
                  className="bg-background border-border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-sm text-foreground">
                  Số điện thoại
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="bg-background border-border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-email" className="text-sm text-foreground">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Nhập email"
                  className="bg-background border-border rounded-lg"
                />
              </div>

              <div className="pt-2 space-y-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground">
                  Đổi mật khẩu (tuỳ chọn)
                </p>
                <div className="space-y-1">
                  <Label htmlFor="current-password" className="text-sm text-foreground">
                    Mật khẩu hiện tại
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="bg-background border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password" className="text-sm text-foreground">
                    Mật khẩu mới
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="bg-background border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password" className="text-sm text-foreground">
                    Xác nhận mật khẩu mới
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="bg-background border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => !isSaving && setIsEditing(false)}
                  disabled={isSaving}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 rounded-lg"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
