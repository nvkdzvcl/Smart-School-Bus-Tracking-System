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

// 1. Định nghĩa từ điển ngôn ngữ
const TRANSLATIONS = {
  vi: {
    settings: "Cài đặt",
    manageAccount: "Quản lý tài khoản và ứng dụng",
    profile: "Thông tin cá nhân",
    noName: "Chưa có tên",
    noPhone: "Chưa có số điện thoại",
    noEmail: "Chưa có email",
    role: "Tài xế",
    editProfile: "Chỉnh sửa thông tin",
    notifications: "Thông báo",
    manageNoti: "Quản lý cài đặt thông báo",
    sound: "Âm thanh",
    soundDesc: "Phát âm thanh khi có thông báo",
    vibration: "Rung",
    vibrationDesc: "Rung khi có thông báo",
    appearance: "Giao diện",
    appearanceDesc: "Tùy chỉnh giao diện ứng dụng",
    darkMode: "Chế độ tối",
    darkModeDesc: "Sử dụng giao diện tối",
    language: "Ngôn ngữ", // Mới
    languageDesc: "Chuyển sang tiếng Anh", // Mới
    support: "Hỗ trợ",
    history: "Lịch sử chuyến đi",
    techSupport: "Yêu cầu hỗ trợ kỹ thuật",
    feedback: "Gửi phản hồi",
    logout: "Đăng xuất",
    // Popup inputs
    editTitle: "Chỉnh sửa thông tin",
    fullName: "Họ và tên",
    enterName: "Nhập họ tên tài xế",
    phone: "Số điện thoại",
    enterPhone: "Nhập số điện thoại",
    email: "Email",
    enterEmail: "Nhập email",
    changePassOptional: "Đổi mật khẩu (tuỳ chọn)",
    currentPass: "Mật khẩu hiện tại",
    enterCurrentPass: "Nhập mật khẩu hiện tại",
    newPass: "Mật khẩu mới",
    enterNewPass: "Nhập mật khẩu mới",
    confirmPass: "Xác nhận mật khẩu mới",
    enterConfirmPass: "Nhập lại mật khẩu mới",
    cancel: "Hủy",
    save: "Lưu thay đổi",
    saving: "Đang lưu...",
    // Alerts
    alertEnterName: "Vui lòng nhập họ tên tài xế.",
    alertFullPass: "Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.",
    alertShortPass: "Mật khẩu mới phải có ít nhất 6 ký tự.",
    alertMatchPass: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
    alertPassSuccess: "Đổi mật khẩu thành công.",
    alertUpdateFail: "Không thể cập nhật thông tin. Vui lòng thử lại.",
    feedbackSubject: "Phản hồi ứng dụng Driver App",
    feedbackBody: "Chào đội kỹ thuật,\n\nMình muốn gửi phản hồi như sau:\n\n- Mô tả vấn đề / góp ý: \n- Thiết bị đang dùng: \n- Phiên bản ứng dụng: Driver App v1.0.0\n\nXin cảm ơn!",
  },
  en: {
    settings: "Settings",
    manageAccount: "Manage account and application",
    profile: "Personal Information",
    noName: "No name",
    noPhone: "No phone number",
    noEmail: "No email",
    role: "Driver",
    editProfile: "Edit Profile",
    notifications: "Notifications",
    manageNoti: "Manage notification settings",
    sound: "Sound",
    soundDesc: "Play sound on notification",
    vibration: "Vibration",
    vibrationDesc: "Vibrate on notification",
    appearance: "Appearance",
    appearanceDesc: "Customize application interface",
    darkMode: "Dark Mode",
    darkModeDesc: "Use dark theme",
    language: "Language", // Mới
    languageDesc: "Switch to English", // Mới
    support: "Support",
    history: "Trip History",
    techSupport: "Technical Support Request",
    feedback: "Send Feedback",
    logout: "Logout",
    // Popup inputs
    editTitle: "Edit Information",
    fullName: "Full Name",
    enterName: "Enter driver name",
    phone: "Phone Number",
    enterPhone: "Enter phone number",
    email: "Email",
    enterEmail: "Enter email",
    changePassOptional: "Change Password (Optional)",
    currentPass: "Current Password",
    enterCurrentPass: "Enter current password",
    newPass: "New Password",
    enterNewPass: "Enter new password",
    confirmPass: "Confirm New Password",
    enterConfirmPass: "Re-enter new password",
    cancel: "Cancel",
    save: "Save Changes",
    saving: "Saving...",
    // Alerts
    alertEnterName: "Please enter driver name.",
    alertFullPass: "Please enter current password, new password, and confirm password.",
    alertShortPass: "New password must be at least 6 characters.",
    alertMatchPass: "New password and confirm password do not match.",
    alertPassSuccess: "Password changed successfully.",
    alertUpdateFail: "Cannot update information. Please try again.",
    feedbackSubject: "Driver App Feedback",
    feedbackBody: "Hi Tech Team,\n\nI would like to send the following feedback:\n\n- Issue description / Suggestion: \n- Device used: \n- App version: Driver App v1.0.0\n\nThank you!",
  },
}

export default function SettingsPage() {
  const navigate = useNavigate()

  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [driverEmail, setDriverEmail] = useState("")

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    return savedTheme === "dark"
  })

  // 2. Language State (Mới)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "vi"
  })

  // Helper để lấy text theo ngôn ngữ hiện tại
const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS]
  // popup edit
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // ===== Load profile =====
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

        localStorage.setItem("driver_name", fullName || "")
        localStorage.setItem("driver_phone", phone || "")
        localStorage.setItem("driver_email", email || "")
      } catch (err) {
        console.error("Lỗi khi load profile:", err)
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("driver_authenticated")
          navigate("/")
        }
      }
    }

    fetchProfile()
  }, [navigate])

  // Sync dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  // 3. Sync language (Mới)
  useEffect(() => {
    localStorage.setItem("language", language)
    window.dispatchEvent(new Event("language-change"))
  }, [language])

  const handleLogout = () => {
    localStorage.removeItem("driver_authenticated")
    localStorage.removeItem("driver_name")
    localStorage.removeItem("driver_phone")
    localStorage.removeItem("driver_email")
    localStorage.removeItem("access_token")
    navigate("/")
  }

  const handleOpenEdit = () => {
    setEditName(driverName)
    setEditPhone(driverPhone)
    setEditEmail(driverEmail)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim()
    const trimmedPhone = editPhone.trim()
    const trimmedEmail = editEmail.trim()

    if (!trimmedName) {
      alert(t.alertEnterName) // Dùng biến dịch
      return
    }

    const wantChangePassword =
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0

    if (wantChangePassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert(t.alertFullPass)
        return
      }
      if (newPassword.length < 6) {
        alert(t.alertShortPass)
        return
      }
      if (newPassword !== confirmPassword) {
        alert(t.alertMatchPass)
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
        alert(t.alertPassSuccess)
      }

      setIsEditing(false)
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin/mật khẩu:", err)
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        alert(err.response.data.message)
      } else {
        alert(t.alertUpdateFail)
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
              <h1 className="text-lg font-semibold text-foreground">{t.settings}</h1>
              <p className="text-xs text-muted-foreground">{t.manageAccount}</p>
            </div>
          </div>
        </div>
      </header>

<main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        
        {/* 1. Profile (Xuất hiện đầu tiên - 0ms) */}
        <Card 
          style={{ animationDelay: "0ms", animationFillMode: "both" }}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 rounded-lg"
        >
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t.profile}</CardTitle>
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
                  {driverName || t.noName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {driverPhone || t.noPhone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {driverEmail || t.noEmail}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
              onClick={handleOpenEdit}
            >
              {t.editProfile}
            </Button>
          </CardContent>
        </Card>

        {/* 2. Notifications (Xuất hiện sau 75ms) */}
        <Card 
          style={{ animationDelay: "75ms", animationFillMode: "both" }}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 rounded-lg"
        >
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t.notifications}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t.manageNoti}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">{t.sound}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.soundDesc}
                </p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">{t.vibration}</Label>
                <p className="text-sm text-muted-foreground">{t.vibrationDesc}</p>
              </div>
              <Switch
                checked={vibrationEnabled}
                onCheckedChange={setVibrationEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Appearance (Xuất hiện sau 150ms) */}
        <Card 
          style={{ animationDelay: "150ms", animationFillMode: "both" }}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 rounded-lg"
        >
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t.appearance}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t.appearanceDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">{t.darkMode}</Label>
                <p className="text-sm text-muted-foreground">{t.darkModeDesc}</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            {/* NÚT CHUYỂN NGÔN NGỮ */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="space-y-0.5">
                <Label className="text-foreground">{t.language}</Label>
                <p className="text-sm text-muted-foreground">{t.languageDesc}</p>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-muted-foreground">
                     {language === 'en' ? 'EN' : 'VI'}
                 </span>
                 <Switch
                    checked={language === 'en'}
                    onCheckedChange={(checked) => setLanguage(checked ? 'en' : 'vi')}
                 />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Support (Xuất hiện sau 225ms) */}
        <Card 
          style={{ animationDelay: "225ms", animationFillMode: "both" }}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 rounded-lg"
        >
          <CardHeader>
            <CardTitle className="text-base text-foreground">{t.support}</CardTitle>
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
              {t.history}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
              onClick={() => {
                window.location.href = "tel:099999999"
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
              {t.techSupport}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
              onClick={() => {
                const subject = encodeURIComponent(t.feedbackSubject)
                const body = encodeURIComponent(t.feedbackBody)
                window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              {t.feedback}
            </Button>

          </CardContent>
        </Card>

        {/* 5. About (Xuất hiện sau 300ms) */}
        <Card 
          style={{ animationDelay: "300ms", animationFillMode: "both" }}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-border/50 rounded-lg"
        >
          <div className="p-3">
            <CardContent
              className="py-1 text-center flex flex-col items-center justify-center gap-0.5"
            >
              <p className="font-bold">Driver App v1.0.0</p>
              <p className="font-medium text-sm">
                © 2025 School Bus Management System
              </p>
            </CardContent>
          </div>
        </Card>

        {/* 6. Logout (Xuất hiện sau 375ms) */}
        <div style={{ animationDelay: "375ms", animationFillMode: "both" }} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent rounded-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t.logout}
          </Button>
        </div>
      </main>

      {/* Popup edit profile */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/30 items-end sm:items-center">
<div className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border/60 shadow-lg animate-in slide-in-from-top-10 fade-in duration-500">
            
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{t.editTitle}</h2>
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
                  {t.fullName}
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t.enterName}
                  className="bg-background border-border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-sm text-foreground">
                  {t.phone}
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder={t.enterPhone}
                  className="bg-background border-border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-email" className="text-sm text-foreground">
                  {t.email}
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder={t.enterEmail}
                  className="bg-background border-border rounded-lg"
                />
              </div>

              <div className="pt-2 space-y-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground">
                  {t.changePassOptional}
                </p>
                <div className="space-y-1">
                  <Label htmlFor="current-password" className="text-sm text-foreground">
                    {t.currentPass}
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t.enterCurrentPass}
                    className="bg-background border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password" className="text-sm text-foreground">
                    {t.newPass}
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.enterNewPass}
                    className="bg-background border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password" className="text-sm text-foreground">
                    {t.confirmPass}
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.enterConfirmPass}
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
                  {t.cancel}
                </Button>
                <Button
                  className="flex-1 rounded-lg"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? t.saving : t.save}
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