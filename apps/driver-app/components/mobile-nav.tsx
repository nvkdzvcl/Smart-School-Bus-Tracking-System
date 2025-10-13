"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful login
    localStorage.setItem("driver_authenticated", "true")
    localStorage.setItem("driver_name", "Nguyễn Văn A")
    localStorage.setItem("driver_phone", phone)

    setIsLoading(false)
    router.push("/dashboard")
  }

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful login
    localStorage.setItem("driver_authenticated", "true")
    localStorage.setItem("driver_name", "Nguyễn Văn A")
    localStorage.setItem("driver_phone", phone)

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Đăng nhập</CardTitle>
        <CardDescription className="text-muted-foreground">Chọn phương thức đăng nhập của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="password">Mật khẩu</TabsTrigger>
            <TabsTrigger value="otp">OTP SMS</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#" className="text-primary hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="otp">
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-otp" className="text-foreground">
                  Số điện thoại
                </Label>
                <Input
                  id="phone-otp"
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                onClick={() => alert("Mã OTP đã được gửi đến số điện thoại của bạn")}
              >
                Gửi mã OTP
              </Button>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground">
                  Mã OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Hỗ trợ: Tiếng Việt / English</p>
        </div>
      </CardContent>
    </Card>
  )
}
