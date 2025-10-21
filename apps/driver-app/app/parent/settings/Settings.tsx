import { useState } from "react"

import { Card, CardContent } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { Label } from "../../../components/ui/Label"
import { Switch } from "../../../components/ui/Switch"
import { Textarea } from "../../../components/ui/Textarea"
import { ParentNav } from "../../../components/ParentNav"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/Dialog.tsx"

import {
  User,
  Bell,
  Globe,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Star,
  MessageSquare,
  HelpCircle,
  Shield,
  ChevronRight,
} from "lucide-react"

export default function ParentSettingsPage() {
  const [notificationSettings, setNotificationSettings] = useState({
    busArrival: true,
    pickup: true,
    delay: true,
    incident: true,
    sound: true,
    vibration: true,
  })

  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")

  // Mock user data
  const user = {
    name: "Nguyễn Thị B",
    phone: "0912-345-678",
    email: "nguyenthib@example.com",
    homeAddress: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
  }

  const handleSubmitFeedback = () => {
    // TODO: gửi feedback lên API
    setRating(0)
    setFeedback("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Cài đặt</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Thông tin cá nhân</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" defaultValue={user.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" defaultValue={user.phone} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue={user.email} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ nhà</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea id="address" defaultValue={user.homeAddress} className="pl-10 min-h-[60px]" />
                </div>
                <p className="text-xs text-muted-foreground">Dùng để tính toán ETA chính xác hơn</p>
              </div>

              <Button className="w-full">Cập nhật thông tin</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Thông báo</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Xe sắp đến</p>
                  <p className="text-sm text-muted-foreground">Thông báo khi xe cách 500m</p>
                </div>
                <Switch
                  checked={notificationSettings.busArrival}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, busArrival: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Đón/trả học sinh</p>
                  <p className="text-sm text-muted-foreground">Thông báo khi con lên/xuống xe</p>
                </div>
                <Switch
                  checked={notificationSettings.pickup}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pickup: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Xe trễ giờ</p>
                  <p className="text-sm text-muted-foreground">Thông báo khi xe bị trễ</p>
                </div>
                <Switch
                  checked={notificationSettings.delay}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, delay: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sự cố</p>
                  <p className="text-sm text-muted-foreground">Thông báo khi có sự cố</p>
                </div>
                <Switch
                  checked={notificationSettings.incident}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, incident: checked })}
                />
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Âm thanh</p>
                  <Switch
                    checked={notificationSettings.sound}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, sound: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Rung</p>
                  <Switch
                    checked={notificationSettings.vibration}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, vibration: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language & Appearance */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Ngôn ngữ & Giao diện</h3>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <span className="text-sm font-medium text-foreground">Ngôn ngữ</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tiếng Việt</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <span className="text-sm font-medium text-foreground">Kích thước chữ</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Trung bình</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback & Rating */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Đánh giá & Phản hồi</h3>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  Gửi phản hồi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Đánh giá dịch vụ</DialogTitle>
                  <DialogDescription>Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Đánh giá của bạn</Label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Nhận xét</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button onClick={handleSubmitFeedback} className="w-full" disabled={rating === 0}>
                    Gửi đánh giá
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Hỗ trợ</h3>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <span className="text-sm font-medium text-foreground">Trung tâm trợ giúp</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <span className="text-sm font-medium text-foreground">Liên hệ hỗ trợ</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Chính sách bảo mật</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">Hotline: 1900-xxxx</p>
              <p className="text-sm text-muted-foreground">Email: support@ssb.vn</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full gap-2 text-destructive hover:bg-destructive/10 bg-transparent">
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground pb-4">
          <p>Smart School Bus v1.0</p>
          <p className="mt-1">© 2025 SSB. All rights reserved.</p>
        </div>
      </main>

      {/* Gộp ParentNav từ Layout.tsx */}
      <ParentNav />
    </div>
  )
}
