import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { Bus, Phone, Mail, Lock } from "lucide-react"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate("/home")
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
          {/* @ts-expect-error lucide-react JSX typing mismatch in this workspace */}
          <Bus className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">SSB Parent</CardTitle>
          <CardDescription className="text-base mt-2">Track your child's school bus safely</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="phone">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">
                  Phone Number
                </Label>
                <div className="relative">
                  {/* @ts-expect-error lucide-react JSX typing mismatch in this workspace */}
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+84 123 456 789"
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-phone" className="text-base">
                  Password
                </Label>
                <div className="relative">
                  {/* @ts-expect-error lucide-react JSX typing mismatch in this workspace */}
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password-phone"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="email">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <div className="relative">
                  {/* @ts-expect-error lucide-react JSX typing mismatch in this workspace */}
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="parent@example.com"
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-email" className="text-base">
                  Password
                </Label>
                <div className="relative">
                  {/* @ts-expect-error lucide-react JSX typing mismatch in this workspace */}
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password-email"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full h-12 text-base bg-transparent">
            Sign in with OTP
          </Button>
          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground">
              Forgot password?
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
