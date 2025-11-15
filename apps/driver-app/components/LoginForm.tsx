import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios" // Import axios

import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"

// --- ĐỌC TỪ FILE .ENV ---
// Vite dùng `import.meta.env`
// Cung cấp 1 giá trị dự phòng (fallback) nếu file .env bị thiếu
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export function LoginForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  // --- DÙNG "phone" (SĐT) ĐỂ KHỚP VỚI DB MỚI ---
  const [phone, setPhone] = useState("") 
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  
  const [error, setError] = useState<string | null>(null)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // --- GỌI API BẰNG "phone" ---
      const response = await axios.post(`${API_URL}/auth/login`, {
        phone: phone, // Gửi "phone"
        password: password,
      })

      const { access_token, driver } = response.data
      
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("driver_authenticated", "true")
      localStorage.setItem("driver_name", driver.name)
      localStorage.setItem("driver_phone", driver.phone)
      localStorage.setItem("driver_email", driver.email);

      setIsLoading(false)
      navigate("/dashboard")

    } catch (err: any) {
      setIsLoading(false)
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Đăng nhập thất bại")
      } else {
        setError("Lỗi không xác định. Vui lòng thử lại.")
      }
    }
  }

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    alert("Chức năng OTP chưa được hỗ trợ")
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-foreground">Đăng nhập</CardTitle>
        <CardDescription className="text-muted-foreground">
          Chọn phương thức đăng nhập của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 rounded-lg overflow-hidden ">
            <TabsTrigger value="password" className="rounded-lg">Mật khẩu</TabsTrigger>
            <TabsTrigger value="otp" className="rounded-lg">OTP SMS</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              
              {/* --- SỬA THÀNH INPUT SĐT --- */}
              <div className="space-y-2 rounded-lg">
                <Label htmlFor="phone" className="text-foreground">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel" // Đổi type
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-background border-border text-foreground rounded-lg"
                />
              </div>

              <div className="space-y-2 ">
                <Label htmlFor="password" className="text-foreground">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border text-foreground rounded-lg"
                />
              </div>

              {error && (
                <div className="text-sm font-medium text-red-500">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#" className="text-primary hover:underline">Quên mật khẩu?</a>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </TabsContent>

          {/* ... (Giữ nguyên Tab OTP) ... */}
          <TabsContent value="otp">
            <form onSubmit={handleOtpLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="phone-otp" className="text-foreground">Số điện thoại</Label>
                    <Input
                    id="phone-otp"
                    type="tel"
                    placeholder="Chức năng này đang phát triển"
                    disabled 
                    className="bg-background border-border text-foreground rounded-lg"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                    disabled 
                >
                    Gửi mã OTP
                </Button>
                <div className="space-y-2">
                    <Label htmlFor="otp" className="text-foreground">Mã OTP</Label>
                    <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    disabled 
                    className="bg-background border-border text-foreground rounded-lg"
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                    disabled 
                >
                    Xác thực OTP
                </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}