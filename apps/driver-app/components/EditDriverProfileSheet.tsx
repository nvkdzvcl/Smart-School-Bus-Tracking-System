// apps/driver-app/src/components/EditDriverProfileSheet.tsx
import { useState, useEffect } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"

interface EditDriverProfileSheetProps {
  open: boolean
  initialName: string
  initialPhone: string
  initialEmail: string
  onClose: () => void
  // name, phone, email, currentPassword?, newPassword?
  onSave: (
    name: string,
    phone: string,
    email: string,
    currentPassword?: string,
    newPassword?: string
  ) => Promise<void> | void
}

export function EditDriverProfileSheet({
  open,
  initialName,
  initialPhone,
  initialEmail,
  onClose,
  onSave,
}: EditDriverProfileSheetProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [email, setEmail] = useState(initialEmail)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isSaving, setIsSaving] = useState(false)

  // mỗi lần mở popup lại sync giá trị mới
  useEffect(() => {
    if (open) {
      setName(initialName)
      setPhone(initialPhone)
      setEmail(initialEmail || "")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }, [open, initialName, initialPhone, initialEmail])

  if (!open) return null

  const handleSave = async () => {
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      alert("Vui lòng nhập họ tên tài xế.")
      return
    }

    // Nếu user nhập một trong các field mật khẩu → bắt nhập đủ & validate
    const wantChangePassword =
      currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0

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

    setIsSaving(true)
    try {
      await onSave(
        trimmedName,
        trimmedPhone,
        trimmedEmail,
        wantChangePassword ? currentPassword : undefined,
        wantChangePassword ? newPassword : undefined
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/30 items-end sm:items-center">
      <div className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border/60 shadow-lg">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Chỉnh sửa thông tin</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => !isSaving && onClose()}
            className="hover:bg-muted"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 space-y-4">
          {/* Họ tên */}
          <div className="space-y-1">
            <Label htmlFor="driver-name" className="text-sm text-foreground">
              Họ và tên
            </Label>
            <Input
              id="driver-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ tên tài xế"
              className="bg-background border-border rounded-lg"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1">
            <Label htmlFor="driver-phone" className="text-sm text-foreground">
              Số điện thoại
            </Label>
            <Input
              id="driver-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="bg-background border-border rounded-lg"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="driver-email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="driver-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              className="bg-background border-border rounded-lg"
            />
          </div>

          {/* Đổi mật khẩu */}
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

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => !isSaving && onClose()}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 rounded-lg"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
