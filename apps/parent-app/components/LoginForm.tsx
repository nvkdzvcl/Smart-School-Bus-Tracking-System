import React, {useState} from "react"
import {useNavigate} from "react-router-dom"
import {Button} from "./ui/Button"
import {Input} from "./ui/Input"
import {Label} from "./ui/Label"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/Card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import {Bus, Lock, Text} from "lucide-react"
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const [studentID, setStudentID] = useState("")
    const [password, setPassword] = useState("")

    const [error, setError] = useState<string | null>(null)

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                {
                    studentID: studentID,
                    password: password,
                }
            )

            const {accessToken, parent} = response.data

            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("parent_authenticated", "true")
            localStorage.setItem("parent_name", parent.name)
            localStorage.setItem("parent_phone", parent.phone)
            localStorage.setItem("parent_email", parent.email)

            localStorage.setItem("parent_id", parent.id)

            setIsLoading(false)
            navigate("/")
        } catch (error) {
            setIsLoading(false)
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.message || "Đăng nhập thất bại")
            } else {
                setError("Lỗi không xác định. Vui lòng thử lại")
            }
        }
    }


    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                    <Bus className="w-8 h-8 text-primary-foreground"/>
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold">SSB Parent 1.0</CardTitle>
                    <CardDescription className="text-base mt-2">Track your child's school bus safely</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {/* <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="phone">Phone</TabsTrigger>
            {/* <TabsTrigger value="email">Email</TabsTrigger> }
          </TabsList> */}

                {/* <TabsContent value="phone"> */}
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="mshs" className="text-base">
                            Student ID
                        </Label>
                        <div className="relative">
                            <Text className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                            <Input
                                id="mshs"
                                type="text"
                                placeholder="3123560000"
                                className="pl-10 h-12 text-base"
                                required
                                onChange={(e) => setStudentID(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-phone" className="text-base">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                            <Input
                                id="password-phone"
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10 h-12 text-base"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm font-medium text-red-500">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
                {/* </TabsContent> */}

                {/* <TabsContent value="email">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <div className="relative">
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
          </TabsContent> */}
                {/* </Tabs> */}

                {/* <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full h-12 text-base bg-transparent">
            Sign in with OTP
          </Button>
          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground">
              Forgot password?
            </Button>
          </div>
        </div> */}
            </CardContent>
        </Card>
    )
}
