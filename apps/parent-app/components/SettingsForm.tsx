import React, {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import axios from "axios"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/Card"
import {Label} from "./ui/Label"
import {Switch} from "./ui/Switch"
import {Button} from "./ui/Button"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/Select"
import {Separator} from "./ui/Separator"
import {Input} from "./ui/Input"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
export default function SettingsForm() {
    const navigate = useNavigate()

    const [parentName, setParentName] = useState("")
    const [parentPhone, setParentPhone] = useState("")
    const [parentEmail, setParentEmail] = useState("")
    const [parentAddress, setParentAddress] = useState("")

    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState("")
    const [editPhone, setEditPhone] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [editAddress, setEditAddress] = useState("")

    const [darkMode, setDarkMode] = useState(true)

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const authenticated = localStorage.getItem("parent_authenticated")
        const token = localStorage.getItem("access_token")

        if (!authenticated || !token) {
            navigate("/login")
            return
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_URL}/profile/me`, {
                    headers: {Authorization: `Bearer ${token}`},
                })

                const {fullName, phone, email, address} = response.data

                setParentName(fullName || "")
                setParentPhone(phone || "")
                setParentEmail(email || "")
                setParentAddress(address || "")

                localStorage.setItem("parent_name", fullName || "")
                localStorage.setItem("parent_phone", phone || "")
                localStorage.setItem("parent_email", email || "")
                localStorage.setItem("parent_address", address || "")
            } catch (error) {
                console.error("Lỗi khi load profile: ", error)

                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.removeItem("access_token")
                    localStorage.removeItem("parent_authenticated")
                    navigate("/login")
                }
            }
        }

        fetchProfile()

        const savedTheme = localStorage.getItem("theme")
        if (savedTheme) {
            const isDark = savedTheme === "dark"
            setDarkMode(isDark)
            document.documentElement.classList.toggle("dark", isDark)
        } else {
            document.documentElement.classList.toggle("dark", true)
        }
    }, [navigate])

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode)
        localStorage.setItem("theme", darkMode ? "dark" : "light")
    }, [darkMode]);

    const handleLogout = () => {
        localStorage.removeItem("parent_authenticated")
        localStorage.removeItem("parent_name")
        localStorage.removeItem("parent_phone")
        localStorage.removeItem("parent_email")
        localStorage.removeItem("parent_address")
        localStorage.removeItem("access_token")
        navigate("/login")
    }

    const handleOpenEdit = () => {
        setEditName(parentName)
        setEditPhone(parentPhone)
        setEditEmail(parentEmail)
        setEditAddress(parentAddress)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setIsEditing(true)
    }

    const handleSaveProfile = async () => {
        const trimmedName = editName.trim()
        const trimmedPhone = editPhone.trim()
        const trimmedEmail = editEmail.trim()
        const trimmedAddress = editAddress.trim()

        if (!trimmedName) {
            alert("Vui lòng nhập họ tên học sinh")
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
            navigate("/login")
            return
        }

        setIsSaving(true)
        try {
            const response = await axios.patch(
                `${API_URL}/profile/me`,
                {
                    fullName: trimmedName,
                    phone: trimmedPhone || undefined,
                    email: trimmedEmail || undefined,
                    address: trimmedAddress || undefined,
                },
                {
                    headers: {Authorization: `Bearer ${token}`},
                }
            )

            const {fullName, phone, email, address} = response.data
            setParentName(fullName || "")
            setParentPhone(phone || "")
            setParentEmail(email || "")
            setParentAddress(address || "")

            localStorage.setItem("parent_name", fullName || "")
            localStorage.setItem("parent_phone", phone || "")
            localStorage.setItem("parent_email", email || "")
            localStorage.setItem("parent_address", address || "")

            if (wantChangePassword) {
                await axios.patch(
                    `${API_URL}/profile/change-password`,
                    {
                        currentPassword,
                        newPassword,
                    },
                    {
                        headers: {Authorization: `Bearer ${token}`},
                    }
                )
                alert("Đổi mật khẩu thành công.")
            }

            setIsEditing(false)
        } catch (error) {
            console.log("Lỗi khi cập nhật thông tin/mật khẩu: ", error)
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                alert(error.response.data.message)
            } else {
                alert("Không thể cập nhật thông tin. Vui lòng thử lại")
            }
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Notifications */}
            {/* <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
            </div>
            <Switch id="push-notifications" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Sound</Label>
              <p className="text-xs text-muted-foreground">Play sound for notifications</p>
            </div>
            <Switch id="sound" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration">Vibration</Label>
              <p className="text-xs text-muted-foreground">Vibrate for important alerts</p>
            </div>
            <Switch id="vibration" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="eta-alerts">ETA Alerts</Label>
              <p className="text-xs text-muted-foreground">Notify when bus is approaching</p>
            </div>
            <Switch id="eta-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card> */}

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20"/>
                            <path d="M12 2a15.3 15.3 0 010 20a15.3 15.3 0 010-20"/>
                        </svg>
                        <CardTitle className="text-base">Preferences</CardTitle>
                    </div>
                    <CardDescription>Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue="en">
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select language"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="vi">Tiếng Việt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator/>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                            <p className="text-xs text-muted-foreground">Use dark theme</p>
                        </div>
                        <Switch id="dark-mode"/>
                    </div>

                    <Separator/>

                    {/* <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-text">Large Text</Label>
              <p className="text-xs text-muted-foreground">Increase font size for better readability</p>
            </div>
            <Switch id="large-text" />
          </div> */}
                </CardContent>
            </Card>

            {/* Location */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <CardTitle className="text-base">Location</CardTitle>
                    </div>
                    <CardDescription>Improve ETA accuracy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-access">Location Access</Label>
              <p className="text-xs text-muted-foreground">Allow app to access your location</p>
            </div>
            <Switch id="location-access" defaultChecked />
          </div> */}

                    <Separator/>

                    <div className="space-y-2">
                        <Label>Home Address</Label>
                        <p className="text-sm">123 Nguyen Van Linh St., District 7, HCMC</p>
                        <Button variant="outline" size="sm" className="bg-transparent">
                            Update Address
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={handleOpenEdit}
                    >
                        Change Profile
                    </Button>
                    {/* <Button variant="outline" className="w-full justify-start bg-transparent">
            Privacy Policy
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Terms of Service
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Help & Support
          </Button> */}

                    <Separator/>

                    <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleLogout}
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Đăng Xuất
                    </Button>
                </CardContent>
            </Card>

            {/* Popup edit profile */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex justify-center bg-black/30 items-end sm:items-center">
                    <div
                        className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border/60 shadow-lg">
                        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-foreground">Chỉnh sửa thông tin</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => !isSaving && setIsEditing(false)}
                                className="hover:bg-muted"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
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
        </div>
    )
}
